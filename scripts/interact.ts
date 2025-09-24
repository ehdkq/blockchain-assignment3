import { createPublicClient, createWalletClient, http, formatEther, parseEther, Address, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
import { myTokenABI } from "../abi";

dotenv.config();

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`${key} environment variable not set`);
  return value;
}

async function main() {
  const rpcUrl = getEnvVar("RPC_URL");
  const privateKey = getEnvVar("PRIVATE_KEY") as `0x${string}`;
  const tokenAddress = getEnvVar("TOKEN_ADDRESS") as Address;
  const chainId = Number(getEnvVar("CHAIN_ID"));

  const didlabChain = defineChain({
    id: chainId, name: `DIDLab Team Chain`,
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } },
  });
  
  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({ account, chain: didlabChain, transport: http(rpcUrl) });
  const publicClient = createPublicClient({ chain: didlabChain, transport: http(rpcUrl) });
  
  const recipientAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const transferAmount = parseEther("100");
  const approveAmount = parseEther("50");

  console.log("--- Initial State ---");
  const initialDeployerBalance = await publicClient.readContract({ address: tokenAddress, abi: myTokenABI, functionName: "balanceOf", args: [account.address] });
  const initialRecipientBalance = await publicClient.readContract({ address: tokenAddress, abi: myTokenABI, functionName: "balanceOf", args: [recipientAddress] });
  console.log(`Deployer Balance: ${formatEther(initialDeployerBalance)}`);
  console.log(`Recipient Balance: ${formatEther(initialRecipientBalance)}`);

  console.log("\n--- Sending Transfer Transaction ---");
  const transferTxHash = await walletClient.writeContract({ address: tokenAddress, abi: myTokenABI, functionName: "transfer", args: [recipientAddress, transferAmount] });
  const transferReceipt = await publicClient.waitForTransactionReceipt({ hash: transferTxHash });
  console.log("Transfer Tx Hash:", transferReceipt.transactionHash);
  console.log("Block Number:", transferReceipt.blockNumber.toString());
  console.log("Gas Used:", transferReceipt.gasUsed.toString());

  console.log("\n--- Sending Approve Transaction ---");
  const approveTxHash = await walletClient.writeContract({ address: tokenAddress, abi: myTokenABI, functionName: "approve", args: [recipientAddress, approveAmount] });
  const approveReceipt = await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
  console.log("Approve Tx Hash:", approveReceipt.transactionHash);
  console.log("Block Number:", approveReceipt.blockNumber.toString());
  console.log("Gas Used:", approveReceipt.gasUsed.toString());

  const allowance = await publicClient.readContract({ address: tokenAddress, abi: myTokenABI, functionName: "allowance", args: [account.address, recipientAddress] });
  console.log(`\nAllowance for recipient: ${formatEther(allowance)}`);

  console.log("\n--- Final State ---");
  const finalDeployerBalance = await publicClient.readContract({ address: tokenAddress, abi: myTokenABI, functionName: "balanceOf", args: [account.address] });
  const finalRecipientBalance = await publicClient.readContract({ address: tokenAddress, abi: myTokenABI, functionName: "balanceOf", args: [recipientAddress] });
  console.log(`Deployer Balance: ${formatEther(finalDeployerBalance)}`);
  console.log(`Recipient Balance: ${formatEther(finalRecipientBalance)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});