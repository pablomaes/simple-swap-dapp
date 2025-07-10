import { run } from "hardhat";

async function main() {
  
  const contractAddress = "0xC9dD7BFcA22Ba08AC04826D18990b48DBe2d3E26"; 
  const tokenA_Address = "0xFF067375EE4dD5Ef60c4Be3482aa42866e0DA10d";   
  const tokenB_Address = "0xd51EFA4C4021134b90A7b378ea29637bFBB80fF2";   
  

  console.log(`Verifying contract at address: ${contractAddress}`);

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [tokenA_Address, tokenB_Address],
      
    });
    console.log("✅ Contract verified successfully on Etherscan!");
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("✅ Contract is already verified!");
    } else {
      console.error("❌ Verification failed:", e);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});