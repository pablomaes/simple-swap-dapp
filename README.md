# SimpleSwap dApp - Audit-Ready Documentation

A fully decentralized token exchange (DEX) built on the Ethereum blockchain. This project allows users to swap between two ERC20 tokens, built with a strong focus on security, gas optimization, and comprehensive testing, following professional smart contract development practices.

**🚀 Live Demo on Sepolia Testnet: [simple-swap-dapp.vercel.app](https://simple-swap-dapp.vercel.app/)**

---

## 🏛️ Architecture Overview

The project follows a standard decentralized application architecture:

*   **Frontend (Client-Side):** A React application built with Vite and TypeScript provides the user interface. It is deployed statically on Vercel.
*   **Blockchain Interaction:** The frontend uses the `ethers.js` library to communicate with the user's wallet (e.g., MetaMask) and to send transactions and read data from the Ethereum blockchain.
*   **Backend (Smart Contracts):** The core logic resides in Solidity smart contracts deployed on the Sepolia testnet. These contracts are immutable and handle all the logic for token swaps and liquidity management.

---

## ✨ Core Features

*   **Wallet Integration:** Securely connect a Web3 wallet to interact with the dApp.
*   **Test Token Faucet:** A key feature for accessibility and testing. Any user can mint 100 TKA and 100 TKB test tokens directly from the UI, enabling immediate use of the swap functionality without needing pre-existing funds.
*   **Real-Time Price Calculation:** View up-to-the-second exchange rates calculated directly from the on-chain reserves.
*   **Secure Swap Flow:** Utilizes the standard two-step `Approve` + `Swap` process to ensure users explicitly consent to token spending, preventing common vulnerabilities.
*   **Professionally Tested & Verified Backend:** The contracts are unit-tested with over 95% coverage and are publicly verified on Etherscan for full transparency.

---

## 📜 Deployed & Verified Contracts (Sepolia)

All contracts have been publicly verified on Etherscan, making their source code transparent and auditable.

*   **SimpleSwap Contract:** [`0x64e530356f28878D34c8983E4F2e590840E7d6a3`](https://sepolia.etherscan.io/address/0x64e530356f28878D34c8983E4F2e590840E7d6a3#code)
*   **Token A (TKA):** [`0x3F590ebB3A61c3C88E8eD573aa3B5d85849649E7`](https://sepolia.etherscan.io/address/0x3F590ebB3A61c3C88E8eD573aa3B5d85849649E7#code)
*   **Token B (TKB):** [`0xb5D51DEA302367864522d2B14813c347AC47bdb2`](https://sepolia.etherscan.io/address/0xb5D51DEA302367864522d2B14813c347AC47bdb2#code)

---

## 🛠️ Tech Stack

| Area      | Technology / Library                                       |
|-----------|------------------------------------------------------------|
| **Backend**   | Solidity, Hardhat, Ethers.js, OpenZeppelin, Chai, Waffle   |
| **Frontend**  | React, Vite, TypeScript, Ethers.js                       |
| **DevOps**    | Vercel (Deployment), GitHub (Version Control), Alchemy (RPC) |

---

## 📂 Project Structure

The repository is a monorepo containing two main packages:


├── backend/ # Contains all Hardhat, Solidity, and contract-related code.
│ ├── contracts/ # The Solidity smart contracts (SimpleSwap, MockERC20).
│ ├── scripts/ # Deployment and helper scripts.
│ ├── test/ # Unit tests for the smart contracts.
│ └── hardhat.config.ts
└── frontend/ # Contains the React UI application.
├── src/
│ ├── App.tsx # Main application component.
│ └── constants/ # Contract ABI and deployed addresses.
└── ...


---

## 🧠 Backend: Smart Contract Details

### Core Logic
The `SimpleSwap.sol` contract implements a basic Automated Market Maker (AMM) using a constant product formula (`x * y = k`). It manages a single liquidity pool for a pair of two ERC20 tokens.

### Security Considerations & Optimizations
The contract was written with security and gas efficiency as primary concerns, addressing crucial feedback:
1.  **Gas Optimization:** All state variables that are read multiple times within a function (`token0`, `token1`, `reserve0`, `reserve1`) are cached in local memory variables at the beginning of the function to minimize expensive `SLOAD` operations.
2.  **Custom Errors:** All `require` statements have been replaced with custom errors (e.g., `SimpleSwap__NoLiquidity()`). This is more gas-efficient than string-based error messages and provides clearer error codes.
3.  **Checks-Effects-Interactions Pattern:** State changes (e.g., updating reserves via `_update`) are performed *before* external calls (`transfer`, `transferFrom`) to mitigate re-entrancy risks.
4.  **Transfer Return Value Check:** Every call to `transfer` and `transferFrom` is wrapped in a check to ensure the call was successful, reverting with `SimpleSwap__TransferFailed()` if not.

### Contract API Reference
This section details the most relevant functions of the `SimpleSwap.sol` contract.

#### Functions

/**
 * @notice Swaps an exact amount of an input token for as much as possible of an output token.
 */
function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external;

/**
 * @notice Calculates the output amount for a given input amount and reserves.
 */
function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) public pure returns (uint amountOut);

/**

 * @notice Returns the price of tokenA in terms of tokenB, scaled to 1e18.
 */
function getPrice(address tokenA, address tokenB) external view returns (uint price);

´´´
#### Events

/// @notice Emitted when a token swap is executed.
event SwapExecuted(address indexed user, address indexed tokenIn, address indexed tokenOut, uint amountIn, uint amountOut);

/// @notice Emitted when liquidity is added to the pool.
event LiquidityAdded(address indexed provider, uint amount0, uint amount1, uint liquidity);

#### 💻 Frontend: UI Details
The user interface is a single-page application built in React.

User Flow
The intended user journey is simple and intuitive:

Connect Wallet: The user first connects their MetaMask wallet.
Get Test Tokens: If the user has no tokens, they can click the "Get Test Tokens" button to receive 100 TKA and TKB from a faucet function in the token contracts.

Input Amount: The user enters the amount of Token A they wish to swap. The UI provides real-time estimates for the amount of Token B they will receive.
Approve: The user must first approve the SimpleSwap contract to spend their Token A. This is a one-time approval per amount.
Swap: After approval, the user can execute the swap.
Core Component
All application logic is contained within frontend/src/App.tsx. It manages the application state (connection status, balances, contract instances) using React hooks (useState, useEffect).

#### 🧪 Testing & Quality Assurance
The smart contracts were rigorously tested using the Hardhat testing environment with Chai for assertions.

Test Coverage
The project exceeds the requirement of 50% test coverage, achieving over 95% line coverage on the core SimpleSwap.sol contract. This ensures that all critical paths, including success cases and failure reverts, are tested.

#### 🚀 Local Development Setup
To run this project locally, follow these steps:

Clone the repository: git clone https://github.com/pablomaes/simple-swap-dapp.git

Install backend dependencies: cd simple-swap-dapp/backend && npm install

Install frontend dependencies: cd ../frontend && npm install

Run a local Hardhat node in a dedicated terminal: cd backend && npx hardhat node

Deploy contracts to the local node in a second terminal: cd backend && npx hardhat run scripts/deploy.ts --network localhost. This script also adds initial liquidity.

Run the frontend development server: cd frontend && npm run dev. The app will be available at http://localhost:5173.


#### Author
Pablo Maestu
