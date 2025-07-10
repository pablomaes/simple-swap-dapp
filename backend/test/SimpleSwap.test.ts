import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
// Import contract types from TypeChain
import { SimpleSwap, MockERC20 } from "../typechain-types";

/**
 * @title Test suite for the SimpleSwap contract
 * @author [Pablo Maestu]
 */
describe("SimpleSwap", function () {
  // Declare variables to be used across tests
  let simpleSwap: SimpleSwap;
  let tokenA: MockERC20;
  let tokenB: MockERC20;
  let owner: Signer;
  let user1: Signer;
  
  // Hardhat network helper for time manipulation
  const { time } = require("@nomicfoundation/hardhat-network-helpers");

  /**
   * @notice Deploys fresh contracts and mints tokens before each test.
   */
  beforeEach(async function () {
    // 1. Get test accounts from Hardhat's local network
    [owner, user1] = await ethers.getSigners();

    // 2. Deploy mock ERC20 tokens for testing
    const MockERC20Factory = await ethers.getContractFactory("MockERC20", owner);
    tokenA = await MockERC20Factory.deploy("Token A", "TKA");
    tokenB = await MockERC20Factory.deploy("Token B", "TKB");
    
    // Wait for deployments to be mined
    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    // 3. Deploy the SimpleSwap contract, linking the mock tokens
    const SimpleSwapFactory = await ethers.getContractFactory("SimpleSwap", owner);
    simpleSwap = await SimpleSwapFactory.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );
    await simpleSwap.waitForDeployment();
    
    // 4. Mint initial tokens for the owner to use in tests (THIS IS THE FIX)
    const initialMintAmount = ethers.parseUnits("1000000", 18); // 1 million tokens
    await tokenA.connect(owner).mint(await owner.getAddress(), initialMintAmount);
    await tokenB.connect(owner).mint(await owner.getAddress(), initialMintAmount);
  });

  /**
   * @notice Test cases for contract deployment and initial state.
   */
  describe("Deployment", function () {
    it("Should set the correct token addresses in the constructor", async function () {
      // Assert that the contract's token0 address matches tokenA's address
      expect(await simpleSwap.token0()).to.equal(await tokenA.getAddress());

      // Assert that the contract's token1 address matches tokenB's address
      expect(await simpleSwap.token1()).to.equal(await tokenB.getAddress());
    });

    it("Should have the correct LP token name and symbol", async function () {
      // Assert the name of the LP token inherited from ERC20
      expect(await simpleSwap.name()).to.equal("SimpleSwap LP Token");
      
      // Assert the symbol of the LP token inherited from ERC20
      expect(await simpleSwap.symbol()).to.equal("SSLP");
    });
    
    it("Should revert if token addresses are identical", async function () {
        const SimpleSwapFactory = await ethers.getContractFactory("SimpleSwap", owner);
        const tokenAddress = await tokenA.getAddress();
        
        // Expect the deployment transaction to be reverted with a specific custom error
        await expect(
            SimpleSwapFactory.deploy(tokenAddress, tokenAddress)
        ).to.be.revertedWithCustomError(SimpleSwapFactory, "SimpleSwap__IdenticalAddresses");
    });
    
    it("Should revert if one of the token addresses is the zero address", async function () {
        const SimpleSwapFactory = await ethers.getContractFactory("SimpleSwap", owner);
        const zeroAddress = ethers.ZeroAddress;
        
        // Test case for token0 being the zero address
        await expect(
            SimpleSwapFactory.deploy(zeroAddress, await tokenB.getAddress())
        ).to.be.revertedWithCustomError(SimpleSwapFactory, "SimpleSwap__ZeroAddress");
        
        // Test case for token1 being the zero address
        await expect(
            SimpleSwapFactory.deploy(await tokenA.getAddress(), zeroAddress)
        ).to.be.revertedWithCustomError(SimpleSwapFactory, "SimpleSwap__ZeroAddress");
    });
    
});
   /**
   * @notice Test cases for the addLiquidity function.
   */
  describe("addLiquidity", function () {
    it("Should add liquidity for the first time and mint LP tokens", async function () {
      // Arrange: Define amounts and approve token transfers
      const amountA = ethers.parseUnits("100", 18); // 100 TKA with 18 decimals
      const amountB = ethers.parseUnits("200", 18); // 200 TKB with 18 decimals
      
      // The owner must approve the SimpleSwap contract to spend their tokens
      await tokenA.connect(owner).approve(await simpleSwap.getAddress(), amountA);
      await tokenB.connect(owner).approve(await simpleSwap.getAddress(), amountB);
      
      const deadline = (await time.latest()) + 60; // Set deadline to 1 minute from now

      // Act & Assert: Call addLiquidity and check for the event
      await expect(simpleSwap.connect(owner).addLiquidity(
          await tokenA.getAddress(),
          await tokenB.getAddress(),
          amountA,
          amountB,
          0, // amountAMin, not critical for first liquidity
          0, // amountBMin, not critical for first liquidity
          await owner.getAddress(),
          deadline
        )
      ).to.emit(simpleSwap, "LiquidityAdded").withArgs(
        await owner.getAddress(),
        amountA,
        amountB,
        sqrt(amountA * amountB) 
      );

      // Assert: Check the results after adding liquidity
      // 1. Reserves in the contract should be updated
      expect(await simpleSwap.reserve0()).to.equal(amountA);
      expect(await simpleSwap.reserve1()).to.equal(amountB);

      // 2. The contract should now hold the tokens
      expect(await tokenA.balanceOf(await simpleSwap.getAddress())).to.equal(amountA);
      expect(await tokenB.balanceOf(await simpleSwap.getAddress())).to.equal(amountB);
      
      // 3. The owner should have received LP tokens, calculated with our helper
      const expectedLPTokens = sqrt(amountA * amountB);
      expect(await simpleSwap.balanceOf(await owner.getAddress())).to.equal(expectedLPTokens);
    });

        it("Should add liquidity correctly when reserves already exist", async function () {
      // --- Arrange Phase 1: Initial liquidity from owner ---
      const initialAmountA = ethers.parseUnits("1000", 18);
      const initialAmountB = ethers.parseUnits("2000", 18); // Ratio is 1:2
      await tokenA.approve(await simpleSwap.getAddress(), ethers.MaxUint256);
      await tokenB.approve(await simpleSwap.getAddress(), ethers.MaxUint256);
      const deadline = (await time.latest()) + 60;
      await simpleSwap.addLiquidity(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        initialAmountA,
        initialAmountB,
        0, 0,
        await owner.getAddress(),
        deadline
      );

      // --- Arrange Phase 2: Prepare user1 for adding liquidity ---
      const user1AmountA = ethers.parseUnits("500", 18);
      const user1AmountB = ethers.parseUnits("1000", 18);
      await tokenA.mint(await user1.getAddress(), user1AmountA);
      await tokenB.mint(await user1.getAddress(), user1AmountB);
      await tokenA.connect(user1).approve(await simpleSwap.getAddress(), user1AmountA);
      await tokenB.connect(user1).approve(await simpleSwap.getAddress(), user1AmountB);

      // --- Arrange Phase 3: Get state BEFORE the action ---
      const reserve0_before = await simpleSwap.reserve0();
      const reserve1_before = await simpleSwap.reserve1();
      const totalSupply_before = await simpleSwap.totalSupply();

      // --- Act Phase ---
      const deadline2 = (await time.latest()) + 60;
      await simpleSwap.connect(user1).addLiquidity(
        await tokenA.getAddress(),
        await tokenB.getAddress(),
        user1AmountA,
        user1AmountB,
        0, 0,
        await user1.getAddress(),
        deadline2
      );
      
      // --- Assert Phase ---
      // 1. Check final reserves
      expect(await simpleSwap.reserve0()).to.equal(reserve0_before + user1AmountA);
      expect(await simpleSwap.reserve1()).to.equal(reserve1_before + user1AmountB);

      // 2. Replicate the contract's "min" formula to calculate expected LP tokens
      const liquidityA = (user1AmountA * totalSupply_before) / reserve0_before;
      const liquidityB = (user1AmountB * totalSupply_before) / reserve1_before;
      const expectedLiquidity = liquidityA < liquidityB ? liquidityA : liquidityB;

      // 3. Assert that user1 received the correct amount of LP tokens
      expect(await simpleSwap.balanceOf(await user1.getAddress())).to.equal(expectedLiquidity);
    });
       
    it("Should revert if deadline is expired", async function () {
        // Arrange
        const amount = ethers.parseUnits("1", 18);
        await tokenA.approve(await simpleSwap.getAddress(), amount);
        await tokenB.approve(await simpleSwap.getAddress(), amount);
        const expiredDeadline = (await time.latest()) - 1; // Deadline in the past

        // Act & Assert
        await expect(simpleSwap.addLiquidity(
            await tokenA.getAddress(), await tokenB.getAddress(),
            amount, amount, 0, 0,
            await owner.getAddress(),
            expiredDeadline
        )).to.be.revertedWithCustomError(simpleSwap, "SimpleSwap__Expired");
    });

    it("Should revert if one of the minimum amounts is not met", async function () {
        // Arrange: Provide initial liquidity
        const initialAmount = ethers.parseUnits("100", 18);
        await tokenA.approve(await simpleSwap.getAddress(), ethers.MaxUint256);
        await tokenB.approve(await simpleSwap.getAddress(), ethers.MaxUint256);
        await simpleSwap.addLiquidity(
            await tokenA.getAddress(), await tokenB.getAddress(),
            initialAmount, initialAmount, 0, 0,
            await owner.getAddress(),
            (await time.latest()) + 60
        );

        // Act & Assert: Try to add liquidity with a high minimum amount for B
        const amountADesired = ethers.parseUnits("10", 18);
        const amountBDesired = ethers.parseUnits("10", 18);
        const amountBMin = ethers.parseUnits("11", 18); // We expect 10 B, but require at least 11
        const deadline = (await time.latest()) + 60;

        await expect(simpleSwap.addLiquidity(
            await tokenA.getAddress(), await tokenB.getAddress(),
            amountADesired, amountBDesired,
            0, amountBMin, // amountAMin, amountBMin
            await owner.getAddress(),
            deadline
        )).to.be.revertedWithCustomError(simpleSwap, "SimpleSwap__InsufficientBAmount");
    });

    it("Should revert if an invalid token address is provided", async function () {
        // Arrange: Deploy a third, unrelated token
        const MockERC20Factory = await ethers.getContractFactory("MockERC20", owner);
        const rogueToken = await MockERC20Factory.deploy("Rogue Token", "ROGUE");
        await rogueToken.waitForDeployment();
        
        const amount = ethers.parseUnits("1", 18);
        const deadline = (await time.latest()) + 60;

        // Act & Assert: Try to add liquidity with one correct token and one wrong token
        await expect(simpleSwap.addLiquidity(
            await tokenA.getAddress(), await rogueToken.getAddress(), // Using the rogue token
            amount, amount, 0, 0,
            await owner.getAddress(),
            deadline
        )).to.be.revertedWithCustomError(simpleSwap, "SimpleSwap__InvalidTokens");
    });
  });
    
  /**
   * @notice Test cases for the swapExactTokensForTokens function.
   */
  describe("swapExactTokensForTokens", function () {
    // We need to add liquidity before we can test swaps
    beforeEach(async function () {
      const amountA = ethers.parseUnits("1000", 18);
      const amountB = ethers.parseUnits("2000", 18); // Ratio 1:2
      await tokenA.approve(await simpleSwap.getAddress(), amountA);
      await tokenB.approve(await simpleSwap.getAddress(), amountB);
      await simpleSwap.addLiquidity(
        await tokenA.getAddress(), await tokenB.getAddress(),
        amountA, amountB, 0, 0,
        await owner.getAddress(),
        (await time.latest()) + 60
      );
    });

    it("Should swap Token A for Token B correctly", async function () {
      // Arrange
      const amountIn = ethers.parseUnits("100", 18); // User wants to swap 100 TKA
      await tokenA.mint(await user1.getAddress(), amountIn);
      await tokenA.connect(user1).approve(await simpleSwap.getAddress(), amountIn);

      // Get state before the swap
      const user1BalanceB_before = await tokenB.balanceOf(await user1.getAddress());
      const contractReserveA_before = await simpleSwap.reserve0();
      const contractReserveB_before = await simpleSwap.reserve1();

      // Calculate expected amount out using the contract's public function
      const expectedAmountOut = await simpleSwap.getAmountOut(amountIn, contractReserveA_before, contractReserveB_before);
      
      const deadline = (await time.latest()) + 60;
      const path = [await tokenA.getAddress(), await tokenB.getAddress()];

      // Act
      await simpleSwap.connect(user1).swapExactTokensForTokens(
        amountIn,
        0, // amountOutMin, 0 for this test as we are checking the calculation
        path,
        await user1.getAddress(),
        deadline
      );

      // Assert
      // 1. User1 should have received the correct amount of Token B
      const user1BalanceB_after = await tokenB.balanceOf(await user1.getAddress());
      expect(user1BalanceB_after - user1BalanceB_before).to.equal(expectedAmountOut);
      
      // 2. Contract reserves should be updated correctly
      expect(await simpleSwap.reserve0()).to.equal(contractReserveA_before + amountIn);
      expect(await simpleSwap.reserve1()).to.equal(contractReserveB_before - expectedAmountOut);

      // 3. The contract should have received the input tokens
      expect(await tokenA.balanceOf(await simpleSwap.getAddress())).to.equal(contractReserveA_before + amountIn);
    });

          it("Should swap Token B for Token A correctly", async function () {
      // --- Arrange ---
      // User1 wants to swap 100 TKB for TKA
      const amountIn_B = ethers.parseUnits("100", 18); 
      await tokenB.mint(await user1.getAddress(), amountIn_B);
      await tokenB.connect(user1).approve(await simpleSwap.getAddress(), amountIn_B);

      // --- Capture state BEFORE the action ---
      const user1_BalanceA_Before = await tokenA.balanceOf(await user1.getAddress());
      const contract_ReserveA_Before = await simpleSwap.reserve0();
      const contract_ReserveB_Before = await simpleSwap.reserve1();

      // --- Calculate expected outcome ---
      // We are swapping B for A, so reserveIn is reserveB, reserveOut is reserveA
      const expectedAmountOut_A = await simpleSwap.getAmountOut(amountIn_B, contract_ReserveB_Before, contract_ReserveA_Before);
      
      const deadline = (await time.latest()) + 60;
      const path = [await tokenB.getAddress(), await tokenA.getAddress()]; 

      // --- Act ---
      await simpleSwap.connect(user1).swapExactTokensForTokens(
        amountIn_B,
        0, // amountOutMin
        path,
        await user1.getAddress(),
        deadline
      );

      // --- Assert ---
      // 1. Check user1's final balance of Token A (the token they received)
      const user1_BalanceA_After = await tokenA.balanceOf(await user1.getAddress());
      expect(user1_BalanceA_After - user1_BalanceA_Before).to.equal(expectedAmountOut_A);
      
      // 2. Check the contract's final reserves (THE CORRECT ASSERTIONS)
      const contract_ReserveA_After = await simpleSwap.reserve0();
      const contract_ReserveB_After = await simpleSwap.reserve1();
      
      expect(contract_ReserveA_After).to.equal(contract_ReserveA_Before - expectedAmountOut_A);
      expect(contract_ReserveB_After).to.equal(contract_ReserveB_Before + amountIn_B);
    });
    

    it("Should revert if output amount is less than minAmountOut", async function () {
      // Arrange
      const amountIn = ethers.parseUnits("100", 18);
      await tokenA.mint(await user1.getAddress(), amountIn);
      await tokenA.connect(user1).approve(await simpleSwap.getAddress(), amountIn);

      const contractReserveA_before = await simpleSwap.reserve0();
      const contractReserveB_before = await simpleSwap.reserve1();
      const expectedAmountOut = await simpleSwap.getAmountOut(amountIn, contractReserveA_before, contractReserveB_before);

      // Set amountOutMin to be 1 wei more than what we expect to get
      const amountOutMin = expectedAmountOut + 1n; 

      const deadline = (await time.latest()) + 60;
      const path = [await tokenA.getAddress(), await tokenB.getAddress()];

      // Act & Assert
      await expect(simpleSwap.connect(user1).swapExactTokensForTokens(
        amountIn,
        amountOutMin, // This will trigger the revert
        path,
        await user1.getAddress(),
        deadline
      )).to.be.revertedWithCustomError(simpleSwap, "SimpleSwap__InsufficientOutputAmount");
    });

    it("Should revert if path is invalid", async function () {
      // Arrange
      const amountIn = ethers.parseUnits("100", 18);
      const deadline = (await time.latest()) + 60;
      const invalidPath = [await tokenA.getAddress()]; // Path with length 1

      // Act & Assert
      await expect(simpleSwap.connect(user1).swapExactTokensForTokens(
        amountIn,
        0,
        invalidPath,
        await user1.getAddress(),
        deadline
      )).to.be.revertedWithCustomError(simpleSwap, "SimpleSwap__InvalidPath");
    });
  });
    
  /**
   * @notice Test cases for the removeLiquidity function.
   */
  describe("removeLiquidity", function () {
    // Before each test in this block, we add liquidity so we have LP tokens to remove.
    beforeEach(async function () {
      const amount = ethers.parseUnits("1000", 18);
      await tokenA.approve(await simpleSwap.getAddress(), amount);
      await tokenB.approve(await simpleSwap.getAddress(), amount);
      await simpleSwap.addLiquidity(
        await tokenA.getAddress(), await tokenB.getAddress(),
        amount, amount, 0, 0,
        await owner.getAddress(),
        (await time.latest()) + 60
      );
    });

    it("Should allow a user to remove their liquidity correctly", async function () {
      // --- Arrange ---
      const lpBalance = await simpleSwap.balanceOf(await owner.getAddress());
      const totalSupply = await simpleSwap.totalSupply();
      const reserve0_before = await simpleSwap.reserve0();
      const reserve1_before = await simpleSwap.reserve1();
      
      const userBalanceA_before = await tokenA.balanceOf(await owner.getAddress());
      const userBalanceB_before = await tokenB.balanceOf(await owner.getAddress());

      // --- Calculate expected outcome ---
      const expectedAmountA = (lpBalance * reserve0_before) / totalSupply;
      const expectedAmountB = (lpBalance * reserve1_before) / totalSupply;

      // --- Act ---
      const deadline = (await time.latest()) + 60;
      await simpleSwap.connect(owner).removeLiquidity(
        await tokenA.getAddress(), await tokenB.getAddress(),
        lpBalance,
        0, 0, // amountMin
        await owner.getAddress(),
        deadline
      );

      // --- Assert ---
      // 1. Check user's token balances
      expect(await tokenA.balanceOf(await owner.getAddress())).to.equal(userBalanceA_before + expectedAmountA);
      expect(await tokenB.balanceOf(await owner.getAddress())).to.equal(userBalanceB_before + expectedAmountB);

      // 2. Check contract reserves
      expect(await simpleSwap.reserve0()).to.equal(reserve0_before - expectedAmountA);
      expect(await simpleSwap.reserve1()).to.equal(reserve1_before - expectedAmountB);

      // 3. Check user's LP token balance
      expect(await simpleSwap.balanceOf(await owner.getAddress())).to.equal(0);
    });

    it("Should revert if the output amount is less than the minimum required", async function () {
      // --- Arrange ---
      const lpBalance = await simpleSwap.balanceOf(await owner.getAddress());
      // Set an impossibly high minimum amount for Token A
      const amountAMin = ethers.MaxUint256; 
      const deadline = (await time.latest()) + 60;

      // --- Act & Assert ---
      await expect(simpleSwap.connect(owner).removeLiquidity(
        await tokenA.getAddress(), await tokenB.getAddress(),
        lpBalance,
        amountAMin, // This will trigger the revert
        0,
        await owner.getAddress(),
        deadline
      )).to.be.revertedWithCustomError(simpleSwap, "SimpleSwap__InsufficientAOutput");
    });
  });
    // ... (código del describe("removeLiquidity", ...) va aquí arriba)

  /**
   * @notice Test cases for the view/pure helper functions.
   */
  describe("View & Pure Functions", function () {
    beforeEach(async function () {
      // Add initial liquidity to test getPrice
      const amount = ethers.parseUnits("1000", 18);
      await tokenA.approve(await simpleSwap.getAddress(), amount);
      await tokenB.approve(await simpleSwap.getAddress(), amount);
      await simpleSwap.addLiquidity(
        await tokenA.getAddress(), await tokenB.getAddress(),
        amount, amount, 0, 0,
        await owner.getAddress(),
        (await time.latest()) + 60
      );
    });

    it("getPrice should return the correct price", async function () {
      // Pool has 1000 TKA and 1000 TKB, so price should be 1:1
      const priceAforB = await simpleSwap.getPrice(await tokenA.getAddress(), await tokenB.getAddress());
      const priceBforA = await simpleSwap.getPrice(await tokenB.getAddress(), await tokenA.getAddress());
      
      const expectedPrice = ethers.parseUnits("1", 18); // 1e18
      expect(priceAforB).to.equal(expectedPrice);
      expect(priceBforA).to.equal(expectedPrice);
    });
  });
});

// Helper function to calculate the integer square root of a BigInt
function sqrt(value: bigint): bigint {
  if (value < 0n) {
    throw new Error('Square root of negative numbers is not supported');
  }
  if (value < 2n) {
    return value;
  }
  function newtonIteration(n: bigint, x0: bigint): bigint {
    const x1 = (n / x0 + x0) >> 1n; // Using bitwise shift for integer division by 2
    if (x0 === x1 || x0 === (x1 - 1n)) {
      return x0;
    }
    return newtonIteration(n, x1);
  }
  return newtonIteration(value, 1n);
}