import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import { privateKeyModInverse } from "secp256k1";
console.log("RPC_URL:", process.env.RPC_URL);
console.log("CHAIN_ID:", process.env.CHAIN_ID);
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);

const RPC_URL = process.env.RPC_URL!;
const CHAIN_ID = Number(process.env.CHAIN_ID || "0");
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    didlab: {
      url: RPC_URL,
      chainId: CHAIN_ID,
      accounts: [PRIVATE_KEY],
      type: "http", // Only allowed types are "http" and "edr-simulated"
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
};

export default config;
