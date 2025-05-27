const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("开始部署合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // 部署 RewardToken 合约
  console.log("\n部署 RewardToken 合约...");
  const RewardToken = await ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy(deployer.address);
  await rewardToken.waitForDeployment();
  const rewardTokenAddress = await rewardToken.getAddress();
  console.log("RewardToken 部署到:", rewardTokenAddress);

  // 部署 MovieArticle 合约
  console.log("\n部署 MovieArticle 合约...");
  const MovieArticle = await ethers.getContractFactory("MovieArticle");
  const movieArticle = await MovieArticle.deploy(rewardTokenAddress, deployer.address);
  await movieArticle.waitForDeployment();
  const movieArticleAddress = await movieArticle.getAddress();
  console.log("MovieArticle 部署到:", movieArticleAddress);

  // 给 MovieArticle 合约铸造权限
  console.log("\n设置权限...");
  const MINTER_ROLE = await rewardToken.MINTER_ROLE();
  await rewardToken.grantRole(MINTER_ROLE, movieArticleAddress);
  console.log("已授予 MovieArticle 合约铸造权限");

  // 给部署者一些初始代币用于测试
  console.log("\n铸造初始代币...");
  const initialSupply = ethers.parseEther("10000"); // 10,000 MWT
  await rewardToken.mint(deployer.address, initialSupply);
  console.log("已铸造 10,000 MWT 给部署者");

  // 更新合约地址配置文件
  const contractAddresses = {
    rewardToken: rewardTokenAddress,
    movieArticle: movieArticleAddress,
    network: "localhost"
  };

  const configPath = path.join(__dirname, "../contract-addresses.json");
  fs.writeFileSync(configPath, JSON.stringify(contractAddresses, null, 2));
  console.log("\n合约地址已保存到 contract-addresses.json");

  // 保存部署信息
  const deploymentInfo = {
    network: "localhost",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      RewardToken: {
        address: rewardTokenAddress,
        name: "MovieWrite Token",
        symbol: "MWT"
      },
      MovieArticle: {
        address: movieArticleAddress,
        rewardTokenAddress: rewardTokenAddress
      }
    }
  };

  const deploymentPath = path.join(__dirname, "../deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("部署信息已保存到 deployment.json");

  // 验证部署
  console.log("\n验证部署...");
  const tokenName = await rewardToken.name();
  const tokenSymbol = await rewardToken.symbol();
  const totalArticles = await movieArticle.getTotalArticles();
  
  console.log("代币名称:", tokenName);
  console.log("代币符号:", tokenSymbol);
  console.log("文章总数:", totalArticles.toString());

  console.log("\n✅ 部署完成！");
  console.log("🎬 MovieWrite 平台已准备就绪");
  console.log("\n下一步:");
  console.log("1. 启动前端: npm run dev");
  console.log("2. 连接钱包到 localhost:8545");
  console.log("3. 开始创建和参与文章！");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署失败:", error);
    process.exit(1);
  }); 