const { ethers } = require("hardhat");
const contractAddresses = require("../contract-addresses.json");

async function main() {
  console.log("🪙 MWT 代币铸造工具\n");

  // 从命令行参数获取地址和数量
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log("使用方法:");
    console.log("npx hardhat run scripts/mint-to-address.js --network localhost -- <地址> [数量]");
    console.log("\n示例:");
    console.log("npx hardhat run scripts/mint-to-address.js --network localhost -- 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 10000");
    console.log("\n如果不指定数量，默认铸造 50,000 MWT");
    return;
  }

  const recipientAddress = args[0];
  const amount = args[1] ? args[1] : "50000";

  // 验证地址格式
  if (!ethers.isAddress(recipientAddress)) {
    console.error("❌ 无效的以太坊地址:", recipientAddress);
    return;
  }

  // 获取部署者账户（有铸造权限）
  const [deployer] = await ethers.getSigners();
  console.log("部署者账户:", deployer.address);

  // 连接到 RewardToken 合约
  const RewardToken = await ethers.getContractFactory("RewardToken");
  const rewardToken = RewardToken.attach(contractAddresses.rewardToken);

  const mintAmount = ethers.parseEther(amount);

  console.log(`\n准备给地址 ${recipientAddress} 铸造 ${ethers.formatEther(mintAmount)} MWT`);

  try {
    // 检查当前余额
    const currentBalance = await rewardToken.balanceOf(recipientAddress);
    console.log(`当前余额: ${ethers.formatEther(currentBalance)} MWT`);

    // 铸造代币
    console.log("\n正在铸造代币...");
    const tx = await rewardToken.mint(recipientAddress, mintAmount);
    console.log("交易哈希:", tx.hash);
    
    // 等待交易确认
    await tx.wait();
    console.log("✅ 代币铸造成功！");

    // 检查新余额
    const newBalance = await rewardToken.balanceOf(recipientAddress);
    console.log(`新余额: ${ethers.formatEther(newBalance)} MWT`);
    console.log(`增加了: ${ethers.formatEther(mintAmount)} MWT`);

  } catch (error) {
    console.error("❌ 铸造失败:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 