import { createPublicClient, http, parseAbiItem, Address, formatEther, defineChain } from "viem";
import * as dotenv from "dotenv";

dotenv.config();

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`${key} environment variable not set`);
  return value;
}

async function main() {
  const rpcUrl = getEnvVar("RPC_URL");
  const tokenAddress = getEnvVar("TOKEN_ADDRESS") as Address;
  const chainId = Number(getEnvVar("CHAIN_ID"));

  const didlabChain = defineChain({
    id: chainId, name: `DIDLab Team Chain`,
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } },
  });

  const publicClient = createPublicClient({ chain: didlabChain, transport: http(rpcUrl) });

  const latestBlock = await publicClient.getBlockNumber();
  const fromBlock = latestBlock > 2000n ? latestBlock - 2000n : 0n;

  console.log(`Querying events for token ${tokenAddress} from block ${fromBlock} to ${latestBlock}...`);

  const transferLogs = await publicClient.getLogs({
    address: tokenAddress,
    event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
    fromBlock,
    toBlock: latestBlock,
  });

  console.log("\n--- Recent Transfer Events ---");
  if (transferLogs.length === 0) {
    console.log("No Transfer events found.");
  } else {
    transferLogs.forEach(log => {
      console.log(
        `Block ${log.blockNumber}: ${log.args.from} -> ${log.args.to}, Value: ${formatEther(log.args.value!)}`
      );
    });
  }

  const approvalLogs = await publicClient.getLogs({
    address: tokenAddress,
    event: parseAbiItem('event Approval(address indexed owner, address indexed spender, uint256 value)'),
    fromBlock,
    toBlock: latestBlock,
  });

  console.log("\n--- Recent Approval Events ---");
  if (approvalLogs.length === 0) {
    console.log("No Approval events found.");
  } else {
    approvalLogs.forEach(log => {
      console.log(
        `Block ${log.blockNumber}: Owner ${log.args.owner} approved ${log.args.spender}, Value: ${formatEther(log.args.value!)}`
      );
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});