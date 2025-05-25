const fs = require('fs');
const path = require('path');

console.log('🎬 MovieWrite 项目设置向导');
console.log('================================');

// 检查是否存在 .env.local 文件
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 创建环境变量文件...');
  
  const envContent = `# WalletConnect Project ID (从 https://cloud.walletconnect.com/ 获取)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=demo

# 智能合约地址 (部署后填入)
NEXT_PUBLIC_MOVIE_ARTICLE_ADDRESS=
NEXT_PUBLIC_REWARD_TOKEN_ADDRESS=

# 网络配置 (用于部署)
SEPOLIA_URL=https://sepolia.infura.io/v3/your_infura_key
POLYGON_URL=https://polygon-mainnet.infura.io/v3/your_infura_key
PRIVATE_KEY=your_private_key_here

# Etherscan API Key (用于合约验证)
ETHERSCAN_API_KEY=your_etherscan_api_key`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local 文件已创建');
} else {
  console.log('✅ .env.local 文件已存在');
}

// 检查合约地址文件
const contractAddressPath = path.join(process.cwd(), 'contract-addresses.json');
if (!fs.existsSync(contractAddressPath)) {
  console.log('📝 创建合约地址配置文件...');
  
  const contractConfig = {
    rewardToken: "",
    movieArticle: "",
    network: "localhost"
  };
  
  fs.writeFileSync(contractAddressPath, JSON.stringify(contractConfig, null, 2));
  console.log('✅ contract-addresses.json 文件已创建');
} else {
  console.log('✅ contract-addresses.json 文件已存在');
}

console.log('\n🚀 设置完成！接下来的步骤：');
console.log('1. 安装依赖: npm install');
console.log('2. 编译合约: npm run compile');
console.log('3. 启动本地区块链: npx hardhat node');
console.log('4. 部署合约: npm run deploy');
console.log('5. 启动前端: npm run dev');
console.log('\n📖 查看 README.md 了解更多详情');
console.log('🎉 祝你使用愉快！'); 