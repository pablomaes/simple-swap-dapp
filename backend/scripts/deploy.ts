import { ethers } from "hardhat";

async function main() {
  console.log("Preparing for deployment to Sepolia...");

  
  const tokenA_Address = "0xFF067375EE4dD5Ef60c4Be3482aa42866e0DA10d";
  const tokenB_Address = "0xd51EFA4C4021134b90A7b378ea29637bFBB80fF2";
  

  if (tokenA_Address.startsWith("0xDIRECCION") || tokenB_Address.startsWith("0xDIRECCION")) {
    console.error("Please replace the token addresses in scripts/deploy.ts");
    process.exit(1);
  }

  console.log(`Using Token A at: ${tokenA_Address}`);
  console.log(`Using Token B at: ${tokenB_Address}`);

  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  
  console.log("\nDeploying SimpleSwap contract...");
  const SimpleSwapFactory = await ethers.getContractFactory("SimpleSwap");
  const simpleSwap = await SimpleSwapFactory.deploy(
    tokenA_Address,
    tokenB_Address
  );

  await simpleSwap.waitForDeployment();
  const simpleSwapAddress = await simpleSwap.getAddress();

  console.log("\n✅ SimpleSwap contract deployed successfully!");
  console.log("   -> Address:", simpleSwapAddress);
  console.log("   -> Transaction hash:", simpleSwap.deploymentTransaction()?.hash);
  console.log("\nNow, go to Sepolia Etherscan to verify the contract manually:");
  console.log(`https://sepolia.etherscan.io/address/${simpleSwapAddress}#code`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});