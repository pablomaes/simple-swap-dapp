import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // --- 1. DEPLOY MOCK TOKENS ---
  const mockErc20Factory = await ethers.getContractFactory("MockERC20");
  
  console.log("Deploying Token A...");
  const tokenA = await mockErc20Factory.deploy("Token A", "TKA");
  await tokenA.waitForDeployment();
  const tokenAAddress = await tokenA.getAddress();
  console.log(`✅ Token A (TKA) deployed to: ${tokenAAddress}`);

  console.log("Deploying Token B...");
  const tokenB = await mockErc20Factory.deploy("Token B", "TKB");
  await tokenB.waitForDeployment();
  const tokenBAddress = await tokenB.getAddress();
  console.log(`✅ Token B (TKB) deployed to: ${tokenBAddress}`);

  // --- 2. MINT INITIAL TOKENS TO DEPLOYER ---
  console.log("\nMinting initial tokens to deployer...");
  const initialMintAmount = ethers.parseUnits("10000", 18);
  
  // --- CORRECCIÓN ---
  // Esperamos a que cada transacción de MINT se complete
  let tx = await tokenA.mint(deployer.address, initialMintAmount);
  await tx.wait(); 
  tx = await tokenB.mint(deployer.address, initialMintAmount);
  await tx.wait();
  console.log(`✅ Minting confirmed.`);

  const balanceA = await tokenA.balanceOf(deployer.address);
  const balanceB = await tokenB.balanceOf(deployer.address);
  console.log(`[DEBUG] Deployer's TKA Balance: ${ethers.formatUnits(balanceA, 18)}`);
  console.log(`[DEBUG] Deployer's TKB Balance: ${ethers.formatUnits(balanceB, 18)}`);
  
  // --- 3. DEPLOY SIMPLESWAP CONTRACT ---
  console.log("\nDeploying SimpleSwap contract...");
  const simpleSwapFactory = await ethers.getContractFactory("SimpleSwap");
  const simpleSwap = await simpleSwapFactory.deploy(tokenAAddress, tokenBAddress);
  await simpleSwap.waitForDeployment();
  const simpleSwapAddress = await simpleSwap.getAddress();
  console.log(`✅ SimpleSwap deployed to: ${simpleSwapAddress}`);

  // --- 4. ADD INITIAL LIQUIDITY ---
  console.log("\nAdding initial liquidity...");
  
  const liquidityAmountA = ethers.parseUnits("1000", 18);
  const liquidityAmountB = ethers.parseUnits("500", 18);

  console.log("Approving tokens for SimpleSwap...");
  // --- CORRECCIÓN ---
  // Esperamos a que cada transacción de APPROVE se complete
  tx = await tokenA.approve(simpleSwapAddress, liquidityAmountA);
  await tx.wait();
  tx = await tokenB.approve(simpleSwapAddress, liquidityAmountB);
  await tx.wait();
  console.log(`✅ Approvals confirmed.`);
  
  const allowanceA = await tokenA.allowance(deployer.address, simpleSwapAddress);
  const allowanceB = await tokenB.allowance(deployer.address, simpleSwapAddress);
  console.log(`[DEBUG] SimpleSwap TKA Allowance: ${ethers.formatUnits(allowanceA, 18)}`);
  console.log(`[DEBUG] SimpleSwap TKB Allowance: ${ethers.formatUnits(allowanceB, 18)}`);

  console.log("\nCalling addLiquidity...");
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
  tx = await simpleSwap.addLiquidity(
    tokenAAddress,
    tokenBAddress,
    liquidityAmountA,
    liquidityAmountB,
    0, 0,
    deployer.address,
    deadline
  );
  await tx.wait(); // Esperamos a que la liquidez se añada
  console.log("✅ Initial liquidity added successfully!");

  console.log("\n🚀 DEPLOYMENT & SETUP COMPLETE! 🚀");
  console.log("========================================");
  console.log("SimpleSwap Address:", simpleSwapAddress);
  console.log("Token A Address:", tokenAAddress);
  console.log("Token B Address:", tokenBAddress);
  console.log("========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});