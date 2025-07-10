// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// --- Custom Errors ---
/// @notice Thrown when a transaction is submitted after its deadline.
error SimpleSwap__Expired();
/// @notice Thrown when the provided tokens do not match the pair's tokens.
error SimpleSwap__InvalidTokens();
/// @notice Thrown when the same address is provided for both tokens.
error SimpleSwap__IdenticalAddresses();
/// @notice Thrown when a zero address is provided for a token.
error SimpleSwap__ZeroAddress();
/// @notice Thrown when the calculated amount of token A is less than the minimum required.
error SimpleSwap__InsufficientAAmount();
/// @notice Thrown when the calculated amount of token B is less than the minimum required.
error SimpleSwap__InsufficientBAmount();
/// @notice Thrown when the amount of liquidity to be minted is zero.
error SimpleSwap__InsufficientLiquidityMinted();
/// @notice Thrown when the output amount of token A is less than the minimum required.
error SimpleSwap__InsufficientAOutput();
/// @notice Thrown when the output amount of token B is less than the minimum required.
error SimpleSwap__InsufficientBOutput();
/// @notice Thrown when the swap path is not of length 2.
error SimpleSwap__InvalidPath();
/// @notice Thrown when the tokens in the path do not match the contract's pair.
error SimpleSwap__InvalidPair();
/// @notice Thrown when the calculated output amount is less than the minimum required.
error SimpleSwap__InsufficientOutputAmount();
/// @notice Thrown when trying to calculate a price or swap with no liquidity.
error SimpleSwap__NoLiquidity();
/// @notice Thrown when the input amount for a calculation is zero.
error SimpleSwap__InsufficientInputAmount();
/// @notice Thrown when an ERC20 transfer or transferFrom call fails.
error SimpleSwap__TransferFailed();


/// @title SimpleSwap
/// @author Pablo Maestu
/// @notice A simplified, single-pair Automated Market Maker (AMM) contract that allows for token swaps and liquidity provision, built with modern Solidity best practices.
contract SimpleSwap is ERC20 {
    /// @notice The first token of the trading pair.
    address public immutable token0;
    /// @notice The second token of the trading pair.
    address public immutable token1;
    /// @notice The reserve of token0 held by this contract.
    uint public reserve0;
    /// @notice The reserve of token1 held by this contract.
    uint public reserve1;

    /// @dev Modifier to ensure a transaction is executed before its deadline.
    modifier ensure(uint deadline) {
        if (block.timestamp > deadline) revert SimpleSwap__Expired();
        _;
    }

    // --- Events ---
    /// @notice Emitted when liquidity is added to the pool.
    /// @param provider The address that provided the liquidity.
    /// @param amount0 The amount of token0 added.
    /// @param amount1 The amount of token1 added.
    /// @param liquidity The amount of LP tokens minted.
    event LiquidityAdded(address indexed provider, uint amount0, uint amount1, uint liquidity);

    /// @notice Emitted when liquidity is removed from the pool.
    /// @param provider The address that removed the liquidity.
    /// @param amount0 The amount of token0 received.
    /// @param amount1 The amount of token1 received.
    event LiquidityRemoved(address indexed provider, uint amount0, uint amount1);
    
    /// @notice Emitted when a token swap is executed.
    /// @param user The address that initiated the swap.
    /// @param tokenIn The address of the input token.
    /// @param tokenOut The address of the output token.
    /// @param amountIn The amount of the input token.
    /// @param amountOut The amount of the output token.
    event SwapExecuted(address indexed user, address indexed tokenIn, address indexed tokenOut, uint amountIn, uint amountOut);


    /// @notice Initializes the contract with a specific pair of tokens and sets up the LP token.
    /// @param _token0 The address of the first ERC20 token.
    /// @param _token1 The address of the second ERC20 token.
    constructor(address _token0, address _token1) ERC20("SimpleSwap LP Token", "SSLP") {
        if (_token0 == address(0) || _token1 == address(0)) revert SimpleSwap__ZeroAddress();
        if (_token0 == _token1) revert SimpleSwap__IdenticalAddresses();
        token0 = _token0;
        token1 = _token1;
    }

    /**
     * @notice Adds liquidity to the token pair pool.
     * @param tokenA The address of one token in the pair.
     * @param tokenB The address of the other token in the pair.
     * @param amountADesired The desired amount of tokenA to add.
     * @param amountBDesired The desired amount of tokenB to add.
     * @param amountAMin The minimum amount of tokenA to add, for slippage protection.
     * @param amountBMin The minimum amount of tokenB to add, for slippage protection.
     * @param to The address that will receive the LP (Liquidity Provider) tokens.
     * @param deadline The timestamp after which the transaction will be reverted.
     * @return amountA The actual amount of tokenA deposited.
     * @return amountB The actual amount of tokenB deposited.
     * @return liquidity The amount of LP tokens minted.
     */
    function addLiquidity(
        address tokenA, address tokenB,
        uint amountADesired, uint amountBDesired,
        uint amountAMin, uint amountBMin,
        address to, uint deadline
    ) external ensure(deadline) returns (uint amountA, uint amountB, uint liquidity) {
        if (!((tokenA == token0 && tokenB == token1) || (tokenA == token1 && tokenB == token0))) revert SimpleSwap__InvalidTokens();

        (uint _reserve0, uint _reserve1) = (reserve0, reserve1);
        
        if (_reserve0 == 0 && _reserve1 == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint amountBOptimal = (amountADesired * _reserve1) / _reserve0;
            if (amountBOptimal <= amountBDesired) {
                if (amountBOptimal < amountBMin) revert SimpleSwap__InsufficientBAmount();
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint amountAOptimal = (amountBDesired * _reserve0) / _reserve1;
                if (amountAOptimal < amountAMin) revert SimpleSwap__InsufficientAAmount();
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }

        (uint amount0, uint amount1) = (tokenA == token0) ? (amountA, amountB) : (amountB, amountA);

        uint totalLPSupply = totalSupply();
        if (totalLPSupply == 0) {
            liquidity = sqrt(amount0 * amount1);
        } else {
            liquidity = min((amount0 * totalLPSupply) / _reserve0, (amount1 * totalLPSupply) / _reserve1);
        }
        if (liquidity == 0) revert SimpleSwap__InsufficientLiquidityMinted();
        _mint(to, liquidity);

        _update(_reserve0 + amount0, _reserve1 + amount1);
        emit LiquidityAdded(msg.sender, amount0, amount1, liquidity);

        if (!IERC20(tokenA).transferFrom(msg.sender, address(this), amountA)) revert SimpleSwap__TransferFailed();
        if (!IERC20(tokenB).transferFrom(msg.sender, address(this), amountB)) revert SimpleSwap__TransferFailed();
    }

    /**
     * @notice Removes liquidity from the pool.
     * @param tokenA The address of one token in the pair.
     * @param tokenB The address of the other token in the pair.
     * @param liquidity The amount of LP tokens to burn.
     * @param amountAMin The minimum amount of tokenA to receive.
     * @param amountBMin The minimum amount of tokenB to receive.
     * @param to The address that will receive the underlying tokens.
     * @param deadline The timestamp after which the transaction will be reverted.
     * @return amountA The actual amount of tokenA received.
     * @return amountB The actual amount of tokenB received.
     */
    function removeLiquidity(
        address tokenA, address tokenB,
        uint liquidity,
        uint amountAMin, uint amountBMin,
        address to, uint deadline
    ) external ensure(deadline) returns (uint amountA, uint amountB) {
        if (!((tokenA == token0 && tokenB == token1) || (tokenA == token1 && tokenB == token0))) revert SimpleSwap__InvalidTokens();
        
        (uint _reserve0, uint _reserve1) = (reserve0, reserve1);
        uint totalLPSupply = totalSupply();
        uint amount0 = (liquidity * _reserve0) / totalLPSupply;
        uint amount1 = (liquidity * _reserve1) / totalLPSupply;

        (amountA, amountB) = (tokenA == token0) ? (amount0, amount1) : (amount1, amount0);
        if (amountA < amountAMin) revert SimpleSwap__InsufficientAOutput();
        if (amountB < amountBMin) revert SimpleSwap__InsufficientBOutput();

        _burn(msg.sender, liquidity);
        _update(_reserve0 - amount0, _reserve1 - amount1);
        emit LiquidityRemoved(msg.sender, amount0, amount1);

        if (!IERC20(token0).transfer(to, amount0)) revert SimpleSwap__TransferFailed();
        if (!IERC20(token1).transfer(to, amount1)) revert SimpleSwap__TransferFailed();
    }

    /**
     * @notice Swaps an exact amount of an input token for as much as possible of an output token.
     * @param amountIn The exact amount of tokens being sent in.
     * @param amountOutMin The minimum amount of output tokens that must be received.
     * @param path The token addresses for the swap: [tokenIn, tokenOut].
     * @param to The recipient of the output tokens.
     * @param deadline The timestamp after which the transaction will be reverted.
     */
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external ensure(deadline) {
        if (path.length != 2) revert SimpleSwap__InvalidPath();
        if (!((path[0] == token0 && path[1] == token1) || (path[0] == token1 && path[1] == token0))) revert SimpleSwap__InvalidPair();
        
        (uint _reserve0, uint _reserve1) = (reserve0, reserve1);

        address tokenIn = path[0];
        address tokenOut = path[1];
        (uint reserveIn, uint reserveOut) = (tokenIn == token0) ? (_reserve0, _reserve1) : (_reserve1, _reserve0);
        
        uint amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
        if (amountOut < amountOutMin) revert SimpleSwap__InsufficientOutputAmount();

        if (tokenIn == token0) {
            _update(_reserve0 + amountIn, _reserve1 - amountOut);
        } else {
            // ================== THIS IS THE FIX ==================
            _update(_reserve0 - amountOut, _reserve1 + amountIn);
            // =====================================================
        }
        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
        
        if (!IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn)) revert SimpleSwap__TransferFailed();
        if (!IERC20(tokenOut).transfer(to, amountOut)) revert SimpleSwap__TransferFailed();
    }

    /**
     * @notice Returns the price of tokenA in terms of tokenB.
     * @param tokenA The address of the token to be priced.
     * @param tokenB The address of the token used as the denomination.
     * @return price The amount of tokenB equivalent to 1e18 units of tokenA.
     */
    function getPrice(address tokenA, address tokenB) external view returns (uint price) {
        if (!((tokenA == token0 && tokenB == token1) || (tokenA == token1 && tokenB == token0))) revert SimpleSwap__InvalidTokens();
        if (reserve0 == 0 || reserve1 == 0) revert SimpleSwap__NoLiquidity();

        if (tokenA == token0) {
            return (reserve1 * 1e18) / reserve0;
        } else {
            return (reserve0 * 1e18) / reserve1;
        }
    }

    /**
     * @notice Calculates the output amount for a given input amount and reserves.
     * @param amountIn The amount of the input token.
     * @param reserveIn The reserve of the input token in the pool.
     * @param reserveOut The reserve of the output token in the pool.
     * @return amountOut The calculated amount of the output token.
     */
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) public pure returns (uint amountOut) {
        if (amountIn == 0) revert SimpleSwap__InsufficientInputAmount();
        if (reserveIn == 0 || reserveOut == 0) revert SimpleSwap__NoLiquidity();
        uint numerator = amountIn * reserveOut;
        uint denominator = reserveIn + amountIn;
        amountOut = numerator / denominator;
    }

    // --- Internal Helper Functions ---

    /**
     * @dev Updates the contract's reserve balances.
     * @param _reserve0 The new reserve for token0.
     * @param _reserve1 The new reserve for token1.
     */
    function _update(uint _reserve0, uint _reserve1) private {
        reserve0 = _reserve0;
        reserve1 = _reserve1;
    }

    /**
     * @dev Computes square root of a number using Babylonian method.
     * @param y The number to compute the square root of.
     * @return z The integer square root of y.
     */
    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    /**
     * @dev Returns the smaller of two numbers.
     * @param x The first number.
     * @param y The second number.
     * @return The smaller of x and y.
     */
    function min(uint x, uint y) internal pure returns (uint) {
        return x < y ? x : y;
    }
}