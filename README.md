# SimpleSwap dApp

A fully decentralized token exchange (DEX) built on the Ethereum blockchain, allowing users to swap between two ERC20 tokens. This project was developed as part of the Module 4 Practical Work, focusing on frontend integration, smart contract testing, and deployment.

**🚀 Live Demo on Sepolia Testnet: [simple-swap-dapp.vercel.app](https://simple-swap-dapp.vercel.app/)**

---

## ✨ Features

*   **Wallet Integration:** Securely connect your Web3 wallet (e.g., MetaMask) to interact with the dApp.
*   **Real-Time Price Feeds:** View up-to-the-second exchange rates fetched directly from the blockchain.
*   **Decentralized Swapping:** Atomically swap tokens with a robust, two-step `Approve` + `Swap` flow for maximum security.
*   **Professionally Tested Backend:** The `SimpleSwap.sol` smart contract has over 95% test coverage, ensuring reliability and security.
*   **Modern Frontend:** Built with React, Vite, and TypeScript for a fast, intuitive, and type-safe user experience.

## 🛠️ Tech Stack

### Backend

*   **Solidity:** Language for smart contracts on the EVM.
*   **Hardhat:** Ethereum development environment for compiling, testing, and deploying contracts.
*   **Ethers.js:** Library for interacting with the Ethereum blockchain.
*   **OpenZeppelin Contracts:** For secure, standard ERC20 implementations.
*   **Chai & Waffle:** Assertion and testing libraries for robust unit tests.

### Frontend

*   **React:** UI library for building the user interface.
*   **Vite:** Next-generation frontend tooling for blazing fast development.
*   **TypeScript:** For static typing and enhanced code quality.
*   **Ethers.js:** To connect the frontend to blockchain data and user wallets.

## Local Development

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/pablomaes/simple-swap-dapp.git
    cd simple-swap-dapp
    ```

2.  **Setup Backend:**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory based on `.env.example` and add your private key and a local node RPC URL.

3.  **Run a local Hardhat node:**
    ```bash
    npx hardhat node
    ```

4.  **Deploy contracts to the local node:**
    In a new terminal window:
    ```bash
    cd backend
    npx hardhat run scripts/deploy.ts --network localhost
    ```
    *Note: The script will deploy mock ERC20 tokens and the SimpleSwap contract, printing their addresses to the console. You will need to update these addresses in the frontend constants file for local testing.*

5.  **Setup Frontend:**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```
    Your application should now be running on `http://localhost:5173`.

---

## 📜 Deployed Contracts on Sepolia Testnet

*   **SimpleSwap Contract:** [`0xC9dD7BFcA22Ba08AC04826D18990b48DBe2d3E26`](https://sepolia.etherscan.io/address/0xC9dD7BFcA22Ba08AC04826D18990b48DBe2d3E26)
*   **Token A (TKA):** [`0xFF067375EE4dD5Ef60c4Be3482aa42866e0DA10d`](https://sepolia.etherscan.io/address/0xFF067375EE4dD5Ef60c4Be3482aa42866e0DA10d)
*   **Token B (TKB):** [`0xd51EFA4C4021134b90A7b378ea29637bFBB80fF2`](https://sepolia.etherscan.io/address/0xd51EFA4C4021134b90A7b378ea29637bFBB80fF2)

---

## 🔌 Contract API Reference

This section details the public interface of the `SimpleSwap.sol` smart contract.

### Functions

```
function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint[] memory amounts)
function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256 amountOut)
function getPrice(address tokenIn, address tokenOut) external view returns (uint256 price)
// Functions for adding/removing liquidity are also available but not used in this specific frontend.
```
### Events

```
event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)
// Events for Mint and Burn (liquidity) are also part of the contract.

```

### Custom Errors

```
error SimpleSwap__Expired()
error SimpleSwap__InvalidTokens()
error SimpleSwap__IdenticalAddresses()
error SimpleSwap__ZeroAddress()
error SimpleSwap__InsufficientAAmount()
error SimpleSwap__InsufficientBAmount()
error SimpleSwap__InsufficientLiquidityMinted()
error SimpleSwap__InsufficientAOutput()
error SimpleSwap__InsufficientBOutput()
error SimpleSwap__InvalidPath()
error SimpleSwap__InvalidPair()
error SimpleSwap__InsufficientOutputAmount()
error SimpleSwap__NoLiquidity()
error SimpleSwap__InsufficientInputAmount()
error SimpleSwap__TransferFailed()
```
