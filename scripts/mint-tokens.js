const { ethers } = require("hardhat");
const contractAddresses = require("../contract-addresses.json");

async function main() {
  console.log("🪙 MWT 代币铸造工具\n");

  // 获取部署者账户（有铸造权限）
  const [deployer] = await ethers.getSigners();
  console.log("部署者账户:", deployer.address);

  // 连接到 RewardToken 合约
  const RewardToken = await ethers.getContractFactory("RewardToken");
  const rewardToken = RewardToken.attach(contractAddresses.rewardToken);

  // 要铸造代币的地址（你可以修改这个地址）
  const recipientAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // 示例地址
  const mintAmount = ethers.parseEther("50000"); // 50,000 MWT

  console.log(`准备给地址 ${recipientAddress} 铸造 ${ethers.formatEther(mintAmount)} MWT`);

  try {
    // 铸造代币
    const tx = await rewardToken.mint(recipientAddress, mintAmount);
    console.log("交易哈希:", tx.hash);
    
    // 等待交易确认
    await tx.wait();
    console.log("✅ 代币铸造成功！");

    // 检查余额
    const balance = await rewardToken.balanceOf(recipientAddress);
    console.log(`${recipientAddress} 的 MWT 余额: ${ethers.formatEther(balance)}`);

  } catch (error) {
    console.error("❌ 铸造失败:", error.message);
  }
}

// 如果直接运行此脚本，执行 main 函数
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main }; 