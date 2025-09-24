RPC URL: `https://hh-02.didlab.org`
Chain ID: `31338`
Deployed Token Address: `0x5fbdb2315678afecb367f032d93f642f64180aa3`
transaction hash from metamask: 0x99d947c2161d9d8c964fe9df6674e256d93c4f3effb3a429ff9c90c59fb24a66

deploy command: npx hardhat run scripts/deploy.ts --network didlab
interact command: npx hardhat run scripts/interact.ts --network didlab
gas-comparison command: npx hardhat run scripts/gas-comparison.ts --network didlab
events command: npx hardhat run scripts/events.ts --network didlab

setup:
1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-folder>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure your environment:**
    * Make a copy of the example environment file:
        ```bash
        cp .env.example .env
        ```
    * Open the `.env` file and add your `PRIVATE_KEY` and any other required values.

  Blockchain Assignment 3 Write-Up
  Blockchain Assignment 3 Write-up

The contract inherits from ERC20Capped, so the maximum token supply is defined and set in the constructor upon deployment. The cap is immutably enforced by the mint function, and that is used by the mint and airdrop functions. For the pausable transfers, it’s inheriting from ERC20Pausable, and it causes it to get the ability to half all transfers in an emergency. It uses pause and unpause functions to trigger the function. For the access control roles, it uses AccessControl for a flexible and secure permissioning system. It uses MINTER_ROLE for creating new tokens and PAUSER_ROLE for managing the pausable state.

For the gas saving, the single batch airdrop consumed 109,180 gas, but all three consumed a total of 110,448 gas. It saved around 1.15% gas, or around 1,268 gas. The reason it saved a little was because of the base transaction cost. Every transaction has an overhead cost of 21,000 gas, so the method of using 3 separate transfers paid the cost 3 times, where the batch only paid it once. The savings were only realized by consolidating the fixed transaction overhead into a single operation.

There were several challenges encountered. My project was blocked by npm errors, including “MODULE_NOT_FOUND” for the hardhat-chai-matchers and an ERESOLVE dependency conflict. I had to do a clean installation and use the –legacy-peer-deps flag to resolve the version mismatch. I also had a variable mismatch with some places saying PRIVKEY and others saying PRIVATE_KEY, so to fix it, I changed them all to PRIVATE_KEY. I also had an error with the deploy due to internet connectivity. It didn’t trust the website since I was on a public wifi network at work.


# Sample Hardhat 3 Beta Project (`node:test` and `viem`)

This project showcases a Hardhat 3 Beta project using the native Node.js test runner (`node:test`) and the `viem` library for Ethereum interactions.

To learn more about the Hardhat 3 Beta, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3). To share your feedback, join our [Hardhat 3 Beta](https://hardhat.org/hardhat3-beta-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new) in our GitHub issue tracker.

## Project Overview

This example project includes:

- A simple Hardhat configuration file.
- Foundry-compatible Solidity unit tests.
- TypeScript integration tests using [`node:test`](nodejs.org/api/test.html), the new Node.js native test runner, and [`viem`](https://viem.sh/).
- Examples demonstrating how to connect to different types of networks, including locally simulating OP mainnet.

## Usage

### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `node:test` tests:

```shell
npx hardhat test solidity
npx hardhat test nodejs
```

### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

To run the deployment to a local chain:

```shell
npx hardhat ignition deploy ignition/modules/Counter.ts
```

To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
```
