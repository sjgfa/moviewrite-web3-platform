const http = require('http');
const { ethers } = require("hardhat");
const contractAddresses = require("../contract-addresses.json");

async function checkStatus() {
  console.log("🔍 检查项目状态...\n");

  // 检查前端服务器
  console.log("1. 检查前端服务器 (localhost:3000):");
  try {
    await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:3000', (res) => {
        console.log(`   ✅ 前端服务器响应: ${res.statusCode}`);
        resolve();
      });
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('超时')));
    });
  } catch (error) {
    console.log(`   ❌ 前端服务器错误: ${error.message}`);
  }

  // 检查Hardhat节点
  console.log("\n2. 检查 Hardhat 节点 (localhost:8545):");
  try {
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const blockNumber = await provider.getBlockNumber();
    console.log(`   ✅ Hardhat 节点正常，当前区块: ${blockNumber}`);
  } catch (error) {
    console.log(`   ❌ Hardhat 节点错误: ${error.message}`);
    return;
  }

  // 检查合约部署
  console.log("\n3. 检查合约部署:");
  try {
    const [signer] = await ethers.getSigners();
    
    // 检查 MovieArticle 合约
    const movieArticleCode = await signer.provider.getCode(contractAddresses.movieArticle);
    if (movieArticleCode === '0x') {
      console.log(`   ❌ MovieArticle 合约未部署: ${contractAddresses.movieArticle}`);
    } else {
      console.log(`   ✅ MovieArticle 合约已部署: ${contractAddresses.movieArticle}`);
    }

    // 检查 RewardToken 合约
    const rewardTokenCode = await signer.provider.getCode(contractAddresses.rewardToken);
    if (rewardTokenCode === '0x') {
      console.log(`   ❌ RewardToken 合约未部署: ${contractAddresses.rewardToken}`);
    } else {
      console.log(`   ✅ RewardToken 合约已部署: ${contractAddresses.rewardToken}`);
    }

  } catch (error) {
    console.log(`   ❌ 合约检查错误: ${error.message}`);
  }

  // 检查ABI文件
  console.log("\n4. 检查 ABI 文件:");
  try {
    const MovieArticleArtifact = require("../artifacts/contracts/MovieArticle.sol/MovieArticle.json");
    const RewardTokenArtifact = require("../artifacts/contracts/RewardToken.sol/RewardToken.json");
    
    console.log(`   ✅ MovieArticle ABI: ${MovieArticleArtifact.abi.length} 个函数/事件`);
    console.log(`   ✅ RewardToken ABI: ${RewardTokenArtifact.abi.length} 个函数/事件`);
  } catch (error) {
    console.log(`   ❌ ABI 文件错误: ${error.message}`);
  }

  console.log("\n📋 状态检查完成！");
  console.log("\n🚀 如果所有项目都显示 ✅，你可以访问 http://localhost:3000 开始使用平台！");
}

checkStatus().catch(console.error); 