const { ethers } = require("hardhat");

async function main() {
  console.log("Starting contract deployment...");

  // Deploy RewardToken with new constructor parameters
  const RewardToken = await ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy(
    "MovieReward",
    "MRT",
    ethers.parseEther("1000000"), // 1 million tokens
    (await ethers.getSigners())[0].address // deployer as initial owner
  );

  await rewardToken.waitForDeployment();
  console.log("RewardToken deployed to:", await rewardToken.getAddress());

  // Deploy MovieArticle
  const MovieArticle = await ethers.getContractFactory("MovieArticle");
  const movieArticle = await MovieArticle.deploy(await rewardToken.getAddress());

  await movieArticle.waitForDeployment();
  console.log("MovieArticle deployed to:", await movieArticle.getAddress());

  // Transfer some tokens to MovieArticle contract for rewards
  const transferAmount = ethers.parseEther("100000"); // 100k tokens
  await rewardToken.transfer(await movieArticle.getAddress(), transferAmount);
  console.log(`Transferred ${ethers.formatEther(transferAmount)} MRT tokens to MovieArticle contract`);

  console.log("\nDeployment completed!");
  console.log("=".repeat(50));
  console.log(`RewardToken: ${await rewardToken.getAddress()}`);
  console.log(`MovieArticle: ${await movieArticle.getAddress()}`);
  console.log("=".repeat(50));

  // Save deployment info
  const deploymentInfo = {
    network: "localhost",
    rewardToken: await rewardToken.getAddress(),
    movieArticle: await movieArticle.getAddress(),
    deployedAt: new Date().toISOString()
  };

  const fs = require("fs");
  fs.writeFileSync("deployment.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 