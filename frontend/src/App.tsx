import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { SIMPLE_SWAP_ADDRESS, SIMPLE_SWAP_ABI } from './constants/contract';

// --- CONSTANTS ---
/**
 * @dev The ABI for the ERC20 token contracts, including the custom faucet function.
 */
const TOKEN_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)", 
    "function allowance(address owner, address spender) view returns (uint256)", 
    "function balanceOf(address account) view returns (uint256)",
    "function faucet()", // Custom function for getting test tokens
];


/**
 * @notice The main application component for the SimpleSwap dApp.
 * @dev This component handles wallet connection, contract interaction, and UI rendering.
 * @author Pablo Maestu 
 */
function App() {
  // =================================================================================
  // STATE VARIABLES
  // =================================================================================
  
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [tokenAContract, setTokenAContract] = useState<ethers.Contract | null>(null);
  const [tokenBContract, setTokenBContract] = useState<ethers.Contract | null>(null);
  const [tokenABalance, setTokenABalance] = useState<string>("");
  const [priceAforB, setPriceAforB] = useState<string>("");
  const [priceBforA, setPriceBforA] = useState<string>("");
  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [needsApproval, setNeedsApproval] = useState<boolean>(false);
  const debounceTimeout = useRef<number | null>(null);

  // =================================================================================
  // WALLET & CONTRACT INITIALIZATION
  // =================================================================================
  
  /**
   * @notice Initializes ethers provider, signer, and contract instances after wallet connection.
   * @dev Creates instances for SimpleSwap, Token A, and Token B contracts.
   * @param userAddress The address of the connected user.
   */
  const initializeEthers = async (userAddress: string) => {
    setIsLoading(true);
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      
      const newContract = new ethers.Contract(SIMPLE_SWAP_ADDRESS, SIMPLE_SWAP_ABI, signer);
      setContract(newContract);
      
      const [token0Address, token1Address] = await Promise.all([newContract.token0(), newContract.token1()]);
      
      const tokenAInstance = new ethers.Contract(token0Address, TOKEN_ABI, signer);
      setTokenAContract(tokenAInstance);
      
      const tokenBInstance = new ethers.Contract(token1Address, TOKEN_ABI, signer);
      setTokenBContract(tokenBInstance);

      const balance = await tokenAInstance.balanceOf(userAddress);
      setTokenABalance(ethers.formatUnits(balance, 18));

      setCurrentAccount(userAddress);
      console.log("Ethers initialized for account:", userAddress);
    } catch (error) {
      console.error("Initialization failed:", error);
      alert("Failed to initialize the application. Please ensure you are on the correct network (e.g., Sepolia) and refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @notice Connects the user's MetaMask wallet to the dApp.
   */
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask to use this dApp.");
        return;
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        await initializeEthers(accounts[0]);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };
  
  // =================================================================================
  // CONTRACT INTERACTION LOGIC
  // =================================================================================

  /**
   * @notice Mints test tokens to the user by calling the faucet function on both token contracts.
   * @dev This allows any user to get tokens to test the application's functionality.
   */
  const handleGetTokens = async () => {
    if (!tokenAContract || !tokenBContract || !currentAccount) {
      alert("Please connect your wallet first.");
      return;
    }
    setIsLoading(true);
    try {
      console.log("Requesting tokens from faucets...");
      const txA = await tokenAContract.faucet();
      const txB = await tokenBContract.faucet();
      
      await Promise.all([txA.wait(), txB.wait()]);

      alert("Tokens received successfully! You got 100 TKA and 100 TKB.");
      
      const newBalance = await tokenAContract.balanceOf(currentAccount);
      setTokenABalance(ethers.formatUnits(newBalance, 18));

    } catch (error: any) {
      console.error("Failed to get tokens:", error);
      alert(`An error occurred while getting tokens: ${error.reason || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @notice Fetches the current swap prices from the SimpleSwap contract.
   */
  const fetchPrices = async () => {
    if (!contract) return;
    try {
      const [token0Address, token1Address] = await Promise.all([contract.token0(), contract.token1()]);
      const [price0, price1] = await Promise.all([
        contract.getPrice(token0Address, token1Address),
        contract.getPrice(token1Address, token0Address)
      ]);
      setPriceAforB(ethers.formatUnits(price0, 18));
      setPriceBforA(ethers.formatUnits(price1, 18));
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  };

  /**
   * @notice Handles input changes for the Token A amount field using debouncing.
   * @dev Validates input, then waits 300ms before fetching the output amount and checking allowance.
   * @param amount The input amount as a string.
   */
  const handleAmountAChange = (amount: string) => {
    setAmountA(amount);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (!amount || !/^\d*\.?\d*$/.test(amount) || Number(amount) <= 0) {
      setAmountB("");
      setNeedsApproval(false);
      return;
    }
    
    if (Number(amount) > Number(tokenABalance)) {
      setAmountB("Insufficient balance");
      setNeedsApproval(false);
      return; 
    }

    debounceTimeout.current = window.setTimeout(async () => {
      if (contract && tokenAContract && currentAccount) {
        try {
          const amountInBigInt = ethers.parseUnits(amount, 18);
          const [reserve0, reserve1] = await Promise.all([contract.reserve0(), contract.reserve1()]);
          const [amountOut, allowance] = await Promise.all([
            contract.getAmountOut(amountInBigInt, reserve0, reserve1),
            tokenAContract.allowance(currentAccount, SIMPLE_SWAP_ADDRESS)
          ]);
          setAmountB(ethers.formatUnits(amountOut, 18));
          setNeedsApproval(allowance < amountInBigInt);
        } catch (error) {
          console.error("Error in debounced handler:", error);
          setAmountB("Error calculating amount");
        }
      }
    }, 300);
  };

  /**
   * @notice Approves the SimpleSwap contract to spend the user's Token A.
   */
  const handleApprove = async () => {
    if (!tokenAContract || !amountA) return;
    setIsLoading(true);
    try {
      const amountToApprove = ethers.parseUnits(amountA, 18);
      const tx = await tokenAContract.approve(SIMPLE_SWAP_ADDRESS, amountToApprove);
      await tx.wait();
      setNeedsApproval(false);
      alert("Approval successful! You can now perform the swap.");
    } catch (error: any) {
      console.error("Approval failed:", error);
      alert(`Approval failed: ${error.reason || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @notice Executes the token swap by calling `swapExactTokensForTokens`.
   */
  const handleSwap = async () => {
    if (!contract || !amountA || !currentAccount || !tokenAContract) return;
    setIsLoading(true);
    try {
      const amountIn = ethers.parseUnits(amountA, 18);
      const amountOutMin = 0; // For simplicity, no slippage protection in this UI
      const path = [await contract.token0(), await contract.token1()];
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
      
      const tx = await contract.swapExactTokensForTokens(amountIn, amountOutMin, path, currentAccount, deadline);
      await tx.wait();
      alert("Swap successful!");
      
      const newBalance = await tokenAContract.balanceOf(currentAccount);
      setTokenABalance(ethers.formatUnits(newBalance, 18));
      setAmountA("");
      setAmountB("");
      fetchPrices();
    } catch (error: any) {
      console.error("Swap failed:", error);
      alert(`Swap failed: ${error.reason || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // =================================================================================
  // SIDE EFFECTS & UI HELPERS
  // =================================================================================

  /**
   * @notice A React Hook to fetch initial data when the contract is ready.
   */
  useEffect(() => {
    if (contract) {
        fetchPrices();
        // Set up a listener for Swap events to refresh prices and balance
        const onSwap = () => {
            console.log("Swap detected, refreshing data...");
            fetchPrices();
            if(tokenAContract && currentAccount) {
                tokenAContract.balanceOf(currentAccount).then(newBalance => {
                    setTokenABalance(ethers.formatUnits(newBalance, 18));
                });
            }
        };
        contract.on("SwapExecuted", onSwap);
        // Cleanup listener on component unmount
        return () => {
            contract.off("SwapExecuted", onSwap);
        };
    }
  }, [contract, currentAccount, tokenAContract]);

  /**
   * @notice A utility function to shorten a wallet address for display.
   * @param address The full wallet address string.
   * @returns A shortened address in the format "0x123...abcd".
   */
  const shortenAddress = (address: string): string => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  /**
   * @notice Determines the correct state (text, action, disabled) for the main button.
   * @returns An object with properties for the button's UI and behavior.
   */
  const renderButton = () => {
    if (!currentAccount) return { text: "Connect Wallet", disabled: false, action: connectWallet };
    if (isLoading) return { text: "Processing...", disabled: true, action: () => {} };
    if (!amountA || Number(amountA) <= 0) return { text: "Enter an amount", disabled: true, action: () => {} };
    if (Number(amountA) > Number(tokenABalance)) return { text: "Insufficient Token A Balance", disabled: true, action: () => {} };
    if (needsApproval) return { text: "Approve Token A", disabled: false, action: handleApprove };
    return { text: "Swap", disabled: false, action: handleSwap };
  };

  // =================================================================================
  // JSX RENDER
  // =================================================================================

  return (
    <div>
      <header>
        <h1>SimpleSwap</h1>
        {currentAccount && (
          <div className="account-info">
            <p>Connected: {shortenAddress(currentAccount)}</p>
          </div>
        )}
      </header>
      
      <main>
        {currentAccount ? (
          <>
            <div className="faucet-container">
              <h3>Need Test Tokens?</h3>
              <p>Get 100 TKA & 100 TKB to start swapping on the Sepolia network.</p>
              <button
                className="faucet-button"
                onClick={handleGetTokens}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Get Test Tokens"}
              </button>
            </div>

            <div className="prices-container">
              <h2>Current Rates</h2>
              <p>1 TKA ≈ {Number(priceAforB).toFixed(5)} TKB</p>
              <p>1 TKB ≈ {Number(priceBforA).toFixed(5)} TKA</p>
            </div>

            <div className="swap-container">
              <h2>Swap Tokens</h2>
              <div className="swap-input">
                <label>You send (TKA) - Balance: {Number(tokenABalance).toFixed(4)}</label>
                <input
                  type="number"
                  placeholder="0.0"
                  value={amountA}
                  onChange={(e) => handleAmountAChange(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="swap-input">
                <label>You receive (TKB)</label>
                <input
                  type="text"
                  placeholder="0.0"
                  value={amountB}
                  readOnly
                />
              </div>
              
              <button
                className="swap-button"
                onClick={renderButton().action}
                disabled={renderButton().disabled}
              >
                {renderButton().text}
              </button>
            </div>
          </>
        ) : (
          <div className="landing-view">
            <h2>Welcome to SimpleSwap</h2>
            <p className="connect-prompt">Please connect your MetaMask wallet to begin.</p>
            <button
                className="swap-button"
                onClick={connectWallet}
              >
                Connect Wallet
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App;