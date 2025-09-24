import { createPublicClient, createWalletClient, http, parseEther, Address, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
import { myTokenABI } from "../abi";

dotenv.config();

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`${key} environment variable not set`);
  return value;
}

const recipients = [
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
] as Address[];

const amounts = [ parseEther("10"), parseEther("20"), parseEther("30") ];

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

  console.log("Performing batch airdrop...");
  const airdropTxHash = await walletClient.writeContract({ address: tokenAddress, abi: myTokenABI, functionName: "airdrop", args: [recipients, amounts] });
  const airdropReceipt = await publicClient.waitForTransactionReceipt({ hash: airdropTxHash });
  const batchGasUsed = airdropReceipt.gasUsed;

  console.log("Performing single transfers...");
  let singleTxsGasUsed = 0n;
  for (let i = 0; i < recipients.length; i++) {
    const txHash = await walletClient.writeContract({ address: tokenAddress, abi: myTokenABI, functionName: "transfer", args: [recipients[i], amounts[i]] });
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    singleTxsGasUsed += receipt.gasUsed;
  }
  
  console.log("\n--- Gas Comparison Summary ---");
  console.log(`Gas for single Batch Airdrop: ${batchGasUsed.toString()}`);
  console.log(`Gas for ${recipients.length} separate Transfers: ${singleTxsGasUsed.toString()}`);

  const gasSaved = singleTxsGasUsed - batchGasUsed;
  const percentageSaved = (Number(gasSaved) / Number(singleTxsGasUsed)) * 100;

  console.log(`\nGas Saved with Batch: ${gasSaved.toString()}`);
  console.log(`Percentage Saved: ${percentageSaved.toFixed(2)}%`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});