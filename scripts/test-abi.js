const { ethers } = require("hardhat");
const contractAddresses = require("../contract-addresses.json");

// 导入ABI
const MovieArticleArtifact = require("../artifacts/contracts/MovieArticle.sol/MovieArticle.json");
const RewardTokenArtifact = require("../artifacts/contracts/RewardToken.sol/RewardToken.json");

async function testABI() {
  console.log("🧪 测试 ABI 加载...\n");

  try {
    // 获取签名者
    const [signer] = await ethers.getSigners();
    console.log("测试账户:", signer.address);

    // 测试 MovieArticle ABI
    console.log("\n📄 测试 MovieArticle ABI:");
    console.log("合约地址:", contractAddresses.movieArticle);
    console.log("ABI 项目数:", MovieArticleArtifact.abi.length);

    const movieArticle = new ethers.Contract(
      contractAddresses.movieArticle,
      MovieArticleArtifact.abi,
      signer
    );

    // 测试读取函数
    const totalArticles = await movieArticle.getTotalArticles();
    console.log("总文章数:", totalArticles.toString());

    const totalContributions = await movieArticle.getTotalContributions();
    console.log("总贡献数:", totalContributions.toString());

    // 测试 RewardToken ABI
    console.log("\n🪙 测试 RewardToken ABI:");
    console.log("合约地址:", contractAddresses.rewardToken);
    console.log("ABI 项目数:", RewardTokenArtifact.abi.length);

    const rewardToken = new ethers.Contract(
      contractAddresses.rewardToken,
      RewardTokenArtifact.abi,
      signer
    );

    // 测试读取函数
    const name = await rewardToken.name();
    const symbol = await rewardToken.symbol();
    const balance = await rewardToken.balanceOf(signer.address);

    console.log("代币名称:", name);
    console.log("代币符号:", symbol);
    console.log("账户余额:", ethers.formatEther(balance), symbol);

    // 测试 createArticle 函数签名
    console.log("\n🔍 测试函数签名:");
    const createArticleFragment = movieArticle.interface.getFunction("createArticle");
    console.log("createArticle 函数:", createArticleFragment.format());

    console.log("\n✅ ABI 测试通过！所有函数都能正确识别。");

  } catch (error) {
    console.error("❌ ABI 测试失败:", error.message);
    console.error("详细错误:", error);
  }
}

testABI(); 