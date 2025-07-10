// Sources flattened with hardhat v2.25.0 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/interfaces/draft-IERC6093.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (interfaces/draft-IERC6093.sol)
pragma solidity ^0.8.20;

/**
 * @dev Standard ERC-20 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC-20 tokens.
 */
interface IERC20Errors {
    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param balance Current balance for the interacting account.
     * @param needed Minimum amount required to perform a transfer.
     */
    error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC20InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC20InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `spender`’s `allowance`. Used in transfers.
     * @param spender Address that may be allowed to operate on tokens without being their owner.
     * @param allowance Amount of tokens a `spender` is allowed to operate with.
     * @param needed Minimum amount required to perform a transfer.
     */
    error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC20InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `spender` to be approved. Used in approvals.
     * @param spender Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC20InvalidSpender(address spender);
}

/**
 * @dev Standard ERC-721 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC-721 tokens.
 */
interface IERC721Errors {
    /**
     * @dev Indicates that an address can't be an owner. For example, `address(0)` is a forbidden owner in ERC-20.
     * Used in balance queries.
     * @param owner Address of the current owner of a token.
     */
    error ERC721InvalidOwner(address owner);

    /**
     * @dev Indicates a `tokenId` whose `owner` is the zero address.
     * @param tokenId Identifier number of a token.
     */
    error ERC721NonexistentToken(uint256 tokenId);

    /**
     * @dev Indicates an error related to the ownership over a particular token. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param tokenId Identifier number of a token.
     * @param owner Address of the current owner of a token.
     */
    error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC721InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC721InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     * @param tokenId Identifier number of a token.
     */
    error ERC721InsufficientApproval(address operator, uint256 tokenId);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC721InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC721InvalidOperator(address operator);
}

/**
 * @dev Standard ERC-1155 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC-1155 tokens.
 */
interface IERC1155Errors {
    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param balance Current balance for the interacting account.
     * @param needed Minimum amount required to perform a transfer.
     * @param tokenId Identifier number of a token.
     */
    error ERC1155InsufficientBalance(address sender, uint256 balance, uint256 needed, uint256 tokenId);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC1155InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC1155InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     * @param owner Address of the current owner of a token.
     */
    error ERC1155MissingApprovalForAll(address operator, address owner);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC1155InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC1155InvalidOperator(address operator);

    /**
     * @dev Indicates an array length mismatch between ids and values in a safeBatchTransferFrom operation.
     * Used in batch transfers.
     * @param idsLength Length of the array of token identifiers
     * @param valuesLength Length of the array of token amounts
     */
    error ERC1155InvalidArrayLength(uint256 idsLength, uint256 valuesLength);
}


// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}


// File @openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (token/ERC20/extensions/IERC20Metadata.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface for the optional metadata functions from the ERC-20 standard.
 */
interface IERC20Metadata is IERC20 {
    /**
     * @dev Returns the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the decimals places of the token.
     */
    function decimals() external view returns (uint8);
}


// File @openzeppelin/contracts/utils/Context.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/token/ERC20/ERC20.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.3.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.20;




/**
 * @dev Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
 *
 * TIP: For a detailed writeup see our guide
 * https://forum.openzeppelin.com/t/how-to-implement-erc20-supply-mechanisms/226[How
 * to implement supply mechanisms].
 *
 * The default value of {decimals} is 18. To change this, you should override
 * this function so it returns a different value.
 *
 * We have followed general OpenZeppelin Contracts guidelines: functions revert
 * instead returning `false` on failure. This behavior is nonetheless
 * conventional and does not conflict with the expectations of ERC-20
 * applications.
 */
abstract contract ERC20 is Context, IERC20, IERC20Metadata, IERC20Errors {
    mapping(address account => uint256) private _balances;

    mapping(address account => mapping(address spender => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * Both values are immutable: they can only be set once during construction.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei. This is the default value returned by this function, unless
     * it's overridden.
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() public view virtual returns (uint8) {
        return 18;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - the caller must have a balance of at least `value`.
     */
    function transfer(address to, uint256 value) public virtual returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, value);
        return true;
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * NOTE: If `value` is the maximum `uint256`, the allowance is not updated on
     * `transferFrom`. This is semantically equivalent to an infinite approval.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 value) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, value);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Skips emitting an {Approval} event indicating an allowance update. This is not
     * required by the ERC. See {xref-ERC20-_approve-address-address-uint256-bool-}[_approve].
     *
     * NOTE: Does not update the allowance if the current allowance
     * is the maximum `uint256`.
     *
     * Requirements:
     *
     * - `from` and `to` cannot be the zero address.
     * - `from` must have a balance of at least `value`.
     * - the caller must have allowance for ``from``'s tokens of at least
     * `value`.
     */
    function transferFrom(address from, address to, uint256 value) public virtual returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transfer(from, to, value);
        return true;
    }

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * NOTE: This function is not virtual, {_update} should be overridden instead.
     */
    function _transfer(address from, address to, uint256 value) internal {
        if (from == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(from, to, value);
    }

    /**
     * @dev Transfers a `value` amount of tokens from `from` to `to`, or alternatively mints (or burns) if `from`
     * (or `to`) is the zero address. All customizations to transfers, mints, and burns should be done by overriding
     * this function.
     *
     * Emits a {Transfer} event.
     */
    function _update(address from, address to, uint256 value) internal virtual {
        if (from == address(0)) {
            // Overflow check required: The rest of the code assumes that totalSupply never overflows
            _totalSupply += value;
        } else {
            uint256 fromBalance = _balances[from];
            if (fromBalance < value) {
                revert ERC20InsufficientBalance(from, fromBalance, value);
            }
            unchecked {
                // Overflow not possible: value <= fromBalance <= totalSupply.
                _balances[from] = fromBalance - value;
            }
        }

        if (to == address(0)) {
            unchecked {
                // Overflow not possible: value <= totalSupply or value <= fromBalance <= totalSupply.
                _totalSupply -= value;
            }
        } else {
            unchecked {
                // Overflow not possible: balance + value is at most totalSupply, which we know fits into a uint256.
                _balances[to] += value;
            }
        }

        emit Transfer(from, to, value);
    }

    /**
     * @dev Creates a `value` amount of tokens and assigns them to `account`, by transferring it from address(0).
     * Relies on the `_update` mechanism
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * NOTE: This function is not virtual, {_update} should be overridden instead.
     */
    function _mint(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(address(0), account, value);
    }

    /**
     * @dev Destroys a `value` amount of tokens from `account`, lowering the total supply.
     * Relies on the `_update` mechanism.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * NOTE: This function is not virtual, {_update} should be overridden instead
     */
    function _burn(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        _update(account, address(0), value);
    }

    /**
     * @dev Sets `value` as the allowance of `spender` over the `owner`'s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     *
     * Overrides to this logic should be done to the variant with an additional `bool emitEvent` argument.
     */
    function _approve(address owner, address spender, uint256 value) internal {
        _approve(owner, spender, value, true);
    }

    /**
     * @dev Variant of {_approve} with an optional flag to enable or disable the {Approval} event.
     *
     * By default (when calling {_approve}) the flag is set to true. On the other hand, approval changes made by
     * `_spendAllowance` during the `transferFrom` operation set the flag to false. This saves gas by not emitting any
     * `Approval` event during `transferFrom` operations.
     *
     * Anyone who wishes to continue emitting `Approval` events on the`transferFrom` operation can force the flag to
     * true using the following override:
     *
     * ```solidity
     * function _approve(address owner, address spender, uint256 value, bool) internal virtual override {
     *     super._approve(owner, spender, value, true);
     * }
     * ```
     *
     * Requirements are the same as {_approve}.
     */
    function _approve(address owner, address spender, uint256 value, bool emitEvent) internal virtual {
        if (owner == address(0)) {
            revert ERC20InvalidApprover(address(0));
        }
        if (spender == address(0)) {
            revert ERC20InvalidSpender(address(0));
        }
        _allowances[owner][spender] = value;
        if (emitEvent) {
            emit Approval(owner, spender, value);
        }
    }

    /**
     * @dev Updates `owner`'s allowance for `spender` based on spent `value`.
     *
     * Does not update the allowance value in case of infinite allowance.
     * Revert if not enough allowance is available.
     *
     * Does not emit an {Approval} event.
     */
    function _spendAllowance(address owner, address spender, uint256 value) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance < type(uint256).max) {
            if (currentAllowance < value) {
                revert ERC20InsufficientAllowance(spender, currentAllowance, value);
            }
            unchecked {
                _approve(owner, spender, currentAllowance - value, false);
            }
        }
    }
}


// File contracts/SimpleSwap.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;
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
