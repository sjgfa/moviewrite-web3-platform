const fs = require('fs');
const path = require('path');

console.log('🔧 修复 Hydration 和连接问题...\n');

// 1. 检查和修复 .env.local 文件
function createEnvFile() {
  const envPath = path.join(__dirname, '../.env.local');
  const envContent = `# Next.js Configuration
NEXT_PUBLIC_ENABLE_TESTNETS=true
NEXT_PUBLIC_PROJECT_ID=local-development
NEXT_PUBLIC_CHAIN_ID=31337

# Hardhat Configuration
HARDHAT_NETWORK=localhost
HARDHAT_RPC_URL=http://127.0.0.1:8545
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ 创建了 .env.local 文件');
  } catch (error) {
    console.log('❌ 无法创建 .env.local 文件:', error.message);
  }
}

// 2. 检查端口占用
async function checkPorts() {
  console.log('🔍 检查端口状态...');
  
  const { spawn } = require('child_process');
  
  // 检查端口3000
  const checkPort = (port) => {
    return new Promise((resolve) => {
      const process = spawn('netstat', ['-ano'], { shell: true });
      let output = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.on('close', () => {
        const isUsed = output.includes(`:${port}`);
        console.log(`  端口 ${port}: ${isUsed ? '❌ 被占用' : '✅ 可用'}`);
        resolve(isUsed);
      });
    });
  };

  await checkPort(3000);
  await checkPort(8545);
}

// 3. 清理缓存文件
function cleanCache() {
  console.log('\n🧹 清理缓存文件...');
  
  const dirsToClean = [
    '.next',
    'node_modules/.cache',
    '.swc'
  ];

  dirsToClean.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`✅ 清理了 ${dir}`);
      } else {
        console.log(`ℹ️  ${dir} 不存在，跳过`);
      }
    } catch (error) {
      console.log(`❌ 无法清理 ${dir}:`, error.message);
    }
  });
}

// 4. 生成启动建议
function generateStartupSuggestions() {
  console.log('\n📋 启动建议:');
  console.log('');
  console.log('1. 重启开发服务器:');
  console.log('   npm run kill:node');
  console.log('   npm run quick-start');
  console.log('');
  console.log('2. 如果仍有错误，按顺序执行:');
  console.log('   npx hardhat node              # 终端1');
  console.log('   npx hardhat run scripts/deploy-and-setup.js --network localhost  # 终端2');
  console.log('   npm run dev                   # 终端3');
  console.log('');
  console.log('3. MetaMask 配置:');
  console.log('   网络名称: Hardhat Local');
  console.log('   RPC URL: http://127.0.0.1:8545');
  console.log('   链ID: 31337');
  console.log('   货币符号: ETH');
  console.log('');
  console.log('4. 测试账户私钥:');
  console.log('   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
}

async function main() {
  try {
    createEnvFile();
    await checkPorts();
    cleanCache();
    generateStartupSuggestions();
    
    console.log('\n🎉 修复完成！');
    console.log('💡 现在可以运行: npm run quick-start');
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error);
  }
}

main(); 