const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("🔍 开始诊断合约状态...\n");

  // 1. 检查网络连接
  const provider = ethers.provider;
  const network = await provider.getNetwork();
  console.log("📡 网络信息:");
  console.log(`  - 链ID: ${network.chainId}`);
  console.log(`  - 网络名称: ${network.name}`);
  
  // 2. 检查合约地址配置
  let contractAddresses;
  try {
    contractAddresses = JSON.parse(fs.readFileSync('contract-addresses.json', 'utf8'));
    console.log("\n📋 合约地址配置:");
    console.log(`  - MovieArticle: ${contractAddresses.movieArticle}`);
    console.log(`  - RewardToken: ${contractAddresses.rewardToken}`);
  } catch (error) {
    console.log("\n❌ 无法读取合约地址配置文件");
    return;
  }

  // 3. 检查合约是否部署
  const movieArticleAddress = contractAddresses.movieArticle;
  const rewardTokenAddress = contractAddresses.rewardToken;

  console.log("\n🔍 检查合约部署状态:");
  
  // 检查MovieArticle合约
  const movieArticleCode = await provider.getCode(movieArticleAddress);
  if (movieArticleCode === "0x") {
    console.log(`❌ MovieArticle合约未部署在地址: ${movieArticleAddress}`);
  } else {
    console.log(`✅ MovieArticle合约已部署在地址: ${movieArticleAddress}`);
    console.log(`   - 字节码长度: ${movieArticleCode.length} 字符`);
  }

  // 检查RewardToken合约
  const rewardTokenCode = await provider.getCode(rewardTokenAddress);
  if (rewardTokenCode === "0x") {
    console.log(`❌ RewardToken合约未部署在地址: ${rewardTokenAddress}`);
  } else {
    console.log(`✅ RewardToken合约已部署在地址: ${rewardTokenAddress}`);
    console.log(`   - 字节码长度: ${rewardTokenCode.length} 字符`);
  }

  // 4. 如果合约已部署，尝试调用函数
  if (movieArticleCode !== "0x") {
    try {
      console.log("\n🧪 测试合约函数调用:");
      
      // 加载合约ABI
      const MovieArticleArtifact = require('../artifacts/contracts/MovieArticle.sol/MovieArticle.json');
      const movieArticle = new ethers.Contract(movieArticleAddress, MovieArticleArtifact.abi, provider);
      
      // 测试getTotalContributions函数
      const totalContributions = await movieArticle.getTotalContributions();
      console.log(`✅ getTotalContributions(): ${totalContributions}`);
      
      // 测试其他基本函数
      const totalArticles = await movieArticle.getTotalArticles();
      console.log(`✅ getTotalArticles(): ${totalArticles}`);
      
    } catch (error) {
      console.log(`❌ 合约函数调用失败: ${error.message}`);
      console.log("   可能的原因:");
      console.log("   - ABI不匹配");
      console.log("   - 合约版本不正确");
      console.log("   - 网络连接问题");
    }
  }

  // 5. 检查账户余额
  console.log("\n💰 账户信息:");
  const accounts = await ethers.getSigners();
  for (let i = 0; i < Math.min(3, accounts.length); i++) {
    const balance = await provider.getBalance(accounts[i].address);
    console.log(`  - 账户${i}: ${accounts[i].address}`);
    console.log(`    余额: ${ethers.formatEther(balance)} ETH`);
  }

  console.log("\n🎯 诊断完成!");
  console.log("\n💡 如果发现问题，请按以下步骤修复:");
  console.log("1. 确保Hardhat节点正在运行: npm run node");
  console.log("2. 重新部署合约: npm run deploy");
  console.log("3. 重启前端: npm run dev");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 诊断过程中发生错误:", error);
    process.exit(1);
  }); 