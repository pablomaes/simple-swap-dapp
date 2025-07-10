import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { SIMPLE_SWAP_ADDRESS, SIMPLE_SWAP_ABI } from './constants/contract';

/**
 * @notice The main application component for the SimpleSwap dApp.
 * @dev This component handles wallet connection, contract interaction, and UI rendering.
 * @author Pablo Maestu & AI Assistant
 */
function App() {
  // =================================================================================
  // STATE VARIABLES
  // =================================================================================
  
  /** @notice The user's connected wallet address. Null if not connected. */
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  
  /** @notice An ethers.js contract instance for our SimpleSwap contract. */
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  
  /** @notice An ethers.js contract instance for the Token A contract. */
  const [tokenAContract, setTokenAContract] = useState<ethers.Contract | null>(null);

  /** @notice The user's balance of Token A. */
  const [tokenABalance, setTokenABalance] = useState<string>("");

  /** @notice The price of Token B in terms of Token A (1 TKA = X TKB). */
  const [priceAforB, setPriceAforB] = useState<string>("");

  /** @notice The price of Token A in terms of Token B (1 TKB = X TKA). */
  const [priceBforA, setPriceBforA] = useState<string>("");

  /** @notice The amount of Token A the user wishes to swap. */
  const [amountA, setAmountA] = useState<string>("");

  /** @notice The estimated amount of Token B the user will receive. */
  const [amountB, setAmountB] = useState<string>("");

  /** @notice A boolean flag to indicate when a transaction is pending. */
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /** @notice A boolean flag indicating if the user needs to approve the token spend. */
  const [needsApproval, setNeedsApproval] = useState<boolean>(false);

  /** @notice A reference to store the debounce timer. */
  const debounceTimeout = useRef<number | null>(null);

  // =================================================================================
  // WALLET & CONTRACT INITIALIZATION
  // =================================================================================
  
  /**
   * @notice Initializes ethers and contract instances after a wallet connection.
   * @dev It sets up a signer, creates instances for both SimpleSwap and Token A contracts,
   *      and fetches the user's initial Token A balance.
   * @param userAddress The address of the connected user.
   */
  const initializeEthers = async (userAddress: string) => {
    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    const signer = await browserProvider.getSigner();
    
    const newContract = new ethers.Contract(SIMPLE_SWAP_ADDRESS, SIMPLE_SWAP_ABI, signer);
    setContract(newContract);
    
    const token0Address = await newContract.token0();
    const tokenAbi = ["function approve(address spender, uint256 amount) returns (bool)", "function allowance(address owner, address spender) view returns (uint256)", "function balanceOf(address account) view returns (uint256)"];
    const tokenAInstance = new ethers.Contract(token0Address, tokenAbi, signer);
    setTokenAContract(tokenAInstance);

    const balance = await tokenAInstance.balanceOf(userAddress);
    setTokenABalance(ethers.formatUnits(balance, 18));

    setCurrentAccount(userAddress);
    console.log("Ethers initialized for account:", userAddress);
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
   * @notice Fetches the current swap prices from the SimpleSwap contract.
   */
  const fetchPrices = async () => {
    if (!contract) return;
    try {
      const token0Address = await contract.token0();
      const token1Address = await contract.token1();
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
   * @dev First validates against balance, then waits 300ms after user stops typing
   *      before fetching the output amount and checking allowance.
   * @param amount The input amount as a string.
   */
  const handleAmountAChange = (amount: string) => {
    setAmountA(amount);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (!amount || Number(amount) <= 0) {
      setAmountB("");
      setNeedsApproval(false);
      return;
    }
    if (Number(amount) > Number(tokenABalance)) {
      setAmountB("");
      setNeedsApproval(false);
      return; 
    }
    debounceTimeout.current = window.setTimeout(async () => {
      if (contract && tokenAContract && currentAccount) {
        try {
          const amountInBigInt = ethers.parseUnits(amount, 18);
          const [amountOut, allowance] = await Promise.all([
            contract.getAmountOut(amountInBigInt, await contract.reserve0(), await contract.reserve1()),
            tokenAContract.allowance(currentAccount, SIMPLE_SWAP_ADDRESS)
          ]);
          setAmountB(ethers.formatUnits(amountOut, 18));
          setNeedsApproval(allowance < amountInBigInt);
        } catch (error) {
          console.error("Error in debounced handler:", error);
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
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Approval failed.");
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
      const amountOutMin = 0; 
      const path = [await contract.token0(), await contract.token1()];
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
      const tx = await contract.swapExactTokensForTokens(amountIn, amountOutMin, path, currentAccount, deadline);
      await tx.wait();
      alert("Swap successful!");
      
      const newBalance = await tokenAContract.balanceOf(currentAccount);
      setTokenABalance(ethers.formatUnits(newBalance, 18));
      setAmountA("");
      setAmountB("");
      fetchPrices();
    } catch (error) {
      console.error("Swap failed:", error);
      alert("Swap failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // =================================================================================
  // SIDE EFFECTS
  // =================================================================================

  /**
   * @notice A React Hook to fetch initial data when the contract is ready.
   */
  useEffect(() => {
    if (contract) fetchPrices();
  }, [contract]);

  // =================================================================================
  // UI HELPER & RENDER LOGIC
  // =================================================================================

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
            <div className="prices-container">
              <h2>Current Rates</h2>
              <p>1 Token A = {priceAforB} Token B</p>
              <p>1 Token B = {priceBforA} Token A</p>
            </div>

            <div className="swap-container">
              <h2>Swap Tokens</h2>
              <div className="swap-input">
                <label>You send (Token A) - Balance: {Number(tokenABalance).toFixed(4)}</label>
                <input
                  type="number"
                  placeholder="0.0"
                  value={amountA}
                  onChange={(e) => handleAmountAChange(e.target.value)}
                  disabled={!currentAccount}
                />
              </div>
              <div className="swap-input">
                <label>You receive (Token B)</label>
                <input
                  type="number"
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
            <p className="connect-prompt">Please connect your wallet to begin swapping.</p>
            <button
                className="swap-button"
                onClick={renderButton().action}
                disabled={renderButton().disabled}
              >
                {renderButton().text}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App