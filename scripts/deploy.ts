import { createPublicClient, createWalletClient, http, parseEther, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import hre from "hardhat";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// --- Main Deployment Function ---
async function main() {
  // Validate that all required environment variables are set
  const {
    RPC_URL,
    PRIVATE_KEY,
    CHAIN_ID,
    TOKEN_NAME,
    TOKEN_SYMBOL,
    TOKEN_CAP,
    TOKEN_INITIAL,
  } = process.env;

  if (
    !RPC_URL ||
    !PRIVATE_KEY ||
    !CHAIN_ID ||
    !TOKEN_NAME ||
    !TOKEN_SYMBOL ||
    !TOKEN_CAP ||
    !TOKEN_INITIAL
  ) {
    throw new Error("Missing required environment variables in .env file.");
  }

  // Convert token amounts from human-readable units to wei (18 decimals) [cite: 19, 20, 43, 55]
  const tokenCapInWei = parseEther(TOKEN_CAP);
  const initialMintInWei = parseEther(TOKEN_INITIAL);

  // Set up the deployer account from the private key
  const account = privateKeyToAccount(`0x${PRIVATE_KEY.replace('0x', '')}`);

  // Define the custom chain configuration using environment variables [cite: 24, 26, 27]
  const didlabChain = defineChain({
    id: parseInt(CHAIN_ID, 10),
    name: "DIDLab Custom Chain",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: [RPC_URL] },
      public: { http: [RPC_URL] },
    },
  });

  // Create Viem clients for interacting with the blockchain [cite: 5, 59]
  const publicClient = createPublicClient({
    chain: didlabChain,
    transport: http(RPC_URL),
  });

  const walletClient = createWalletClient({
    account,
    chain: didlabChain,
    transport: http(RPC_URL),
  });

  console.log(`--- DEPLOYING CONTRACT ---`);
  console.log(`Deployer Address: ${account.address}`);
  console.log(`Token Name: "${TOKEN_NAME}", Symbol: "${TOKEN_SYMBOL}"`);
  console.log(`Max Supply (Cap): ${TOKEN_CAP} tokens`);
  console.log(`Initial Mint: ${TOKEN_INITIAL} tokens`);
  console.log("--------------------------\n");

  try {
    // Read the contract's artifact to get its ABI and bytecode
    // IMPORTANT: Replace "CampusCredit" with the actual name of your contract file if it's different.
    const contractArtifact = await hre.artifacts.readArtifact("MyToken");

    // Deploy the contract [cite: 62]
    const deployTxHash = await walletClient.deployContract({
      abi: contractArtifact.abi,
      bytecode: contractArtifact.bytecode as `0x${string}`,
      args: [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        tokenCapInWei,
        account.address, // The deployer will be the initial token receiver
        initialMintInWei,
      ],
      account: account,
    });

    // --- Wait for confirmation and print results ---
    console.log(`✅ Deploy transaction sent successfully!`);
    console.log(`Transaction Hash: ${deployTxHash}`); // [cite: 64]
    console.log(`Waiting for deployment confirmation...`);

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: deployTxHash,
    });

    if (!receipt.contractAddress) {
      throw new Error("Contract deployment failed: No contract address found in receipt.");
    }
    
    console.log("\n--- DEPLOYMENT COMPLETE ---");
    console.log(`Contract Deployed to: ${receipt.contractAddress}`); // [cite: 65]
    console.log(`Block Number: ${receipt.blockNumber}`); // [cite: 66]
    console.log("---------------------------\n");
    console.log("Next Step: Copy the contract address above and paste it into your .env file as TOKEN_ADDRESS."); // [cite: 67]

  } catch (error) {
    console.error("\n❌ An error occurred during deployment:", error);
    process.exit(1); // Exit with a non-zero code on failure [cite: 81]
  }
}

main();