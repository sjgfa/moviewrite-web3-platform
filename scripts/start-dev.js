const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 启动 MovieWrite 开发环境...\n');

// 检查是否已有合约部署
const contractAddressesPath = path.join(__dirname, '../contract-addresses.json');
let contractsDeployed = false;

try {
  const addresses = JSON.parse(fs.readFileSync(contractAddressesPath, 'utf8'));
  if (addresses.movieArticle && addresses.rewardToken) {
    contractsDeployed = true;
    console.log('✅ 发现已部署的合约');
    console.log(`📄 MovieArticle: ${addresses.movieArticle}`);
    console.log(`🪙 RewardToken: ${addresses.rewardToken}\n`);
  }
} catch (error) {
  console.log('ℹ️  未发现已部署的合约，将进行部署\n');
}

async function startHardhatNode() {
  return new Promise((resolve, reject) => {
    console.log('🔗 启动 Hardhat 本地节点...');
    const nodeProcess = spawn('npx', ['hardhat', 'node'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    let nodeReady = false;

    nodeProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      
      if (output.includes('Started HTTP and WebSocket JSON-RPC server') && !nodeReady) {
        nodeReady = true;
        console.log('✅ Hardhat 节点已启动\n');
        resolve(nodeProcess);
      }
    });

    nodeProcess.stderr.on('data', (data) => {
      console.error('节点错误:', data.toString());
    });

    nodeProcess.on('close', (code) => {
      if (!nodeReady) {
        reject(new Error(`节点启动失败，退出码: ${code}`));
      }
    });

    // 超时处理
    setTimeout(() => {
      if (!nodeReady) {
        reject(new Error('节点启动超时'));
      }
    }, 30000);
  });
}

async function startDevelopment() {
  let nodeProcess = null;
  
  try {
    // 启动 Hardhat 节点
    nodeProcess = await startHardhatNode();

    // 等待节点完全启动
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 如果合约未部署，先部署
    if (!contractsDeployed) {
      console.log('📦 部署智能合约...');
      const deployProcess = spawn('npx', ['hardhat', 'run', 'scripts/deploy-and-setup.js', '--network', 'localhost'], {
        stdio: 'inherit',
        shell: true
      });

      await new Promise((resolve, reject) => {
        deployProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ 合约部署成功\n');
            resolve();
          } else {
            reject(new Error(`部署失败，退出码: ${code}`));
          }
        });
      });
    }

    // 启动前端开发服务器
    console.log('🌐 启动前端开发服务器...');
    const devProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    console.log('\n🎬 MovieWrite 开发环境已启动！');
    console.log('📱 前端地址: http://localhost:3000');
    console.log('⛓️  区块链网络: localhost:8545');
    console.log('\n💡 提示:');
    console.log('1. Hardhat 节点已自动启动');
    console.log('2. 在 MetaMask 中添加 localhost:8545 网络');
    console.log('3. 导入 Hardhat 测试账户私钥');
    console.log('4. 开始创建和参与电影文章！\n');

    // 处理进程退出
    process.on('SIGINT', () => {
      console.log('\n👋 正在关闭开发环境...');
      if (nodeProcess) nodeProcess.kill('SIGINT');
      devProcess.kill('SIGINT');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ 启动失败:', error.message);
    if (nodeProcess) nodeProcess.kill('SIGINT');
    process.exit(1);
  }
}

startDevelopment(); 