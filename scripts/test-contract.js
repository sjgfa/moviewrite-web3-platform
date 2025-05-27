const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function testContract() {
  try {
    console.log("🧪 测试合约功能...");
    
    // 读取合约地址
    const addressesPath = path.join(__dirname, '../contract-addresses.json');
    const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
    
    console.log("📄 合约地址:");
    console.log(`  MovieArticle: ${addresses.movieArticle}`);
    console.log(`  RewardToken: ${addresses.rewardToken}`);
    
    // 获取合约实例
    const MovieArticle = await ethers.getContractFactory("MovieArticle");
    const movieArticle = MovieArticle.attach(addresses.movieArticle);
    
    const RewardToken = await ethers.getContractFactory("RewardToken");
    const rewardToken = RewardToken.attach(addresses.rewardToken);
    
    // 获取账户
    const [deployer] = await ethers.getSigners();
    console.log("\n👤 部署者账户:", deployer.address);
    
    // 测试基本合约调用
    console.log("\n🔍 测试合约调用...");
    
    try {
      const totalArticles = await movieArticle.getTotalArticles();
      console.log(`✅ 总文章数: ${totalArticles}`);
    } catch (error) {
      console.log(`❌ 获取文章数失败: ${error.message}`);
    }
    
    try {
      const totalContributions = await movieArticle.getTotalContributions();
      console.log(`✅ 总贡献数: ${totalContributions}`);
    } catch (error) {
      console.log(`❌ 获取贡献数失败: ${error.message}`);
    }
    
    try {
      const balance = await rewardToken.balanceOf(deployer.address);
      console.log(`✅ 部署者代币余额: ${ethers.formatEther(balance)} MWT`);
    } catch (error) {
      console.log(`❌ 获取代币余额失败: ${error.message}`);
    }
    
    try {
      const contractBalance = await rewardToken.balanceOf(addresses.movieArticle);
      console.log(`✅ 合约代币余额: ${ethers.formatEther(contractBalance)} MWT`);
    } catch (error) {
      console.log(`❌ 获取合约余额失败: ${error.message}`);
    }
    
    // 测试创建文章
    console.log("\n📝 测试创建文章...");
    try {
      const tx = await movieArticle.createArticle(
        "测试文章", 
        "测试电影", 
        "科幻", 
        100,  // 目标贡献数
        10    // 最大参与者
      );
      await tx.wait();
      console.log(`✅ 文章创建成功! 交易哈希: ${tx.hash}`);
      
      const newTotalArticles = await movieArticle.getTotalArticles();
      console.log(`✅ 新的文章总数: ${newTotalArticles}`);
      
    } catch (error) {
      console.log(`❌ 创建文章失败: ${error.message}`);
    }
    
    console.log("\n🎉 合约测试完成!");
    console.log("\n💡 如果所有测试都通过，说明合约工作正常");
    console.log("   现在可以安全地使用前端应用了");
    
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

testContract(); 