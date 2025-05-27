const { ethers } = require("hardhat");

async function main() {
  console.log("🔑 Hardhat 测试账户信息:\n");
  
  const accounts = await ethers.getSigners();
  
  for (let i = 0; i < Math.min(accounts.length, 10); i++) {
    const account = accounts[i];
    const balance = await account.provider.getBalance(account.address);
    
    console.log(`账户 ${i}:`);
    console.log(`  地址: ${account.address}`);
    console.log(`  余额: ${ethers.formatEther(balance)} ETH`);
    console.log(`  私钥: 请从 Hardhat 节点输出中查看\n`);
  }
  
  console.log("💡 使用说明:");
  console.log("1. 复制任意账户地址和私钥");
  console.log("2. 在 MetaMask 中导入私钥");
  console.log("3. 确保网络设置为 localhost:8545");
  console.log("4. 链ID: 31337");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 