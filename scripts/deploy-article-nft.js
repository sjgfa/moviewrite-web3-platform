const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 开始部署ArticleNFT合约...\n");

  // 获取部署账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 部署信息:");
  console.log(`  部署账户: ${deployer.address}`);
  console.log(`  账户余额: ${hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH\n`);

  // 部署合约参数
  const contractName = "MovieWrite Article NFT";
  const contractSymbol = "MWART";
  const platformFeeRecipient = deployer.address; // 在生产环境中应该使用专门的平台地址

  console.log("⚙️  合约参数:");
  console.log(`  名称: ${contractName}`);
  console.log(`  符号: ${contractSymbol}`);
  console.log(`  平台费用接收者: ${platformFeeRecipient}\n`);

  // 部署ArticleNFT合约
  console.log("🔨 编译和部署合约...");
  const ArticleNFT = await hre.ethers.getContractFactory("ArticleNFT");
  
  const articleNFT = await ArticleNFT.deploy(
    contractName,
    contractSymbol,
    platformFeeRecipient
  );

  await articleNFT.waitForDeployment();
  const contractAddress = await articleNFT.getAddress();

  console.log(`✅ ArticleNFT合约部署成功！`);
  console.log(`   合约地址: ${contractAddress}\n`);

  // 验证部署
  console.log("🔍 验证部署...");
  const deployedName = await articleNFT.name();
  const deployedSymbol = await articleNFT.symbol();
  const deployedRecipient = await articleNFT.platformFeeRecipient();
  const platformFeePercent = await articleNFT.platformFeePercent();
  const royaltyPercent = await articleNFT.defaultRoyaltyPercent();
  const mintFee = await articleNFT.mintFee();

  console.log("📊 合约状态:");
  console.log(`  名称: ${deployedName}`);
  console.log(`  符号: ${deployedSymbol}`);
  console.log(`  平台费用接收者: ${deployedRecipient}`);
  console.log(`  平台费用比例: ${Number(platformFeePercent) / 100}%`);
  console.log(`  默认版税比例: ${Number(royaltyPercent) / 100}%`);
  console.log(`  铸造费用: ${hre.ethers.formatEther(mintFee)} ETH\n`);

  // 保存部署信息
  const deploymentInfo = {
    contractName: "ArticleNFT",
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    parameters: {
      name: contractName,
      symbol: contractSymbol,
      platformFeeRecipient: platformFeeRecipient
    },
    settings: {
      platformFeePercent: platformFeePercent.toString(),
      defaultRoyaltyPercent: royaltyPercent.toString(),
      mintFee: mintFee.toString()
    }
  };

  // 更新部署配置文件
  const deploymentPath = path.join(__dirname, '..', 'deployment.json');
  let deployments = {};
  
  try {
    if (fs.existsSync(deploymentPath)) {
      deployments = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    }
  } catch (error) {
    console.log("⚠️  无法读取现有部署文件，将创建新文件");
  }

  deployments.ArticleNFT = deploymentInfo;
  fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));

  console.log(`💾 部署信息已保存到: ${deploymentPath}\n`);

  // 在测试网络上验证合约（如果可能）
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔗 在区块链浏览器上验证合约...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [contractName, contractSymbol, platformFeeRecipient],
      });
      console.log("✅ 合约验证成功！");
    } catch (error) {
      console.log("⚠️  合约验证失败:", error.message);
      console.log("   请手动在区块链浏览器上验证合约");
    }
  }

  // 显示后续步骤
  console.log("\n🎯 部署完成！后续步骤:");
  console.log("1. 在前端应用中更新合约地址");
  console.log("2. 配置IPFS集成");
  console.log("3. 设置适当的平台费用接收地址");
  console.log("4. 测试NFT铸造和交易功能");
  console.log("5. 考虑设置多重签名管理");

  // 返回部署信息供其他脚本使用
  return {
    contractAddress,
    deploymentInfo
  };
}

// 允许脚本被直接运行或作为模块导入
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ 部署失败:", error);
      process.exit(1);
    });
} else {
  module.exports = main;
}