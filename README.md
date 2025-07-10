# SimpleSwap dApp

A fully decentralized token exchange (DEX) built on the Ethereum blockchain, allowing users to swap between two ERC20 tokens. This project was developed as part of the Module 4 Practical Work.

**Live Demo URL:** [**Your Vercel Link Here**]

---

## 🚀 Features

*   **Wallet Integration:** Securely connect using MetaMask.
*   **Real-Time Price Feeds:** View up-to-the-second exchange rates fetched directly from the smart contract.
*   **Decentralized Swapping:** Atomically swap tokens with a robust, two-step `Approve` + `Swap` flow.
*   **Professionally Tested Backend:** The `SimpleSwap.sol` smart contract has over 95% test coverage, ensuring reliability and security.
*   **Modern Frontend:** Built with React, Vite, and TypeScript for a fast and type-safe user experience.

## 🛠️ Tech Stack

### Backend

*   **Solidity:** Language for smart contracts.
*   **Hardhat:** Ethereum development environment for compiling, testing, and deploying contracts.
*   **Ethers.js:** Library for interacting with the Ethereum blockchain.
*   **OpenZeppelin Contracts:** For secure, standard ERC20 implementations.
*   **Chai:** Assertion library for testing.

### Frontend

*   **React:** UI library.
*   **Vite:** Next-generation frontend tooling for blazing fast development.
*   **TypeScript:** For static typing and code quality.
*   **Ethers.js:** To connect the frontend to the blockchain.

## Local Development

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd SimpleSwap-Project
    ```

2.  **Setup Backend:**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory based on the `.env.example` file and add your private key and RPC URL.

3.  **Run a local Hardhat node:**
    ```bash
    npx hardhat node
    ```

4.  **Deploy contracts to the local node:**
    In a new terminal:
    ```bash
    cd backend
    npx hardhat run scripts/deploy.ts --network localhost
    ```
    *Note: You will need to update the token addresses in `deploy.ts` to mock addresses for local testing.*

5.  **Setup Frontend:**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```
    Your application should now be running on `http://localhost:5173`.

---

## 📜 Contract API Reference

This section details the public interface of the `SimpleSwap.sol` smart contract.

### Functions

```solidity
function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)
function removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) external returns (uint256 amountA, uint256 amountB)
function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external
function getPrice(address tokenA, address tokenB) external view returns (uint256 price)
function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256 amountOut)
```

### Events

```solidity
event LiquidityAdded(address indexed provider, uint256 amount0, uint256 amount1, uint256 liquidity)
event LiquidityRemoved(address indexed provider, uint256 amount0, uint256 amount1)
event SwapExecuted(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut)
```

### Custom Errors

```solidity
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