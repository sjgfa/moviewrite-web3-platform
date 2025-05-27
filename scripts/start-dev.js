const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 启动 MovieWrite 开发环境...\n');

// 检查Hardhat配置
function checkHardhatConfig() {
  try {
    const configPath = path.join(__dirname, '../hardhat.config.cjs');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    if (configContent.includes('chainId: 31337')) {
      console.log('✅ Hardhat配置正确 (链ID: 31337)');
      return true;
    } else if (configContent.includes('chainId: 1337')) {
      console.log('❌ Hardhat配置错误 (链ID: 1337)，需要修改为31337');
      return false;
    } else {
      console.log('⚠️  未找到链ID配置');
      return false;
    }
  } catch (error) {
    console.log('❌ 无法读取Hardhat配置文件');
    return false;
  }
}

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

async function killExistingProcesses() {
  console.log('🧹 清理现有进程...');
  
  // Windows系统清理node进程
  if (process.platform === 'win32') {
    try {
      await new Promise((resolve) => {
        const killProcess = spawn('taskkill', ['/f', '/im', 'node.exe'], {
          stdio: 'ignore',
          shell: true
        });
        killProcess.on('close', () => resolve());
        setTimeout(resolve, 2000); // 2秒超时
      });
      console.log('✅ 已清理现有进程');
    } catch (error) {
      console.log('ℹ️  无现有进程需要清理');
    }
  }
  
  // 等待端口释放
  await new Promise(resolve => setTimeout(resolve, 1000));
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
        console.log('✅ Hardhat 节点已启动 (链ID: 31337)\n');
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

async function deployContracts() {
  console.log('📦 编译和部署智能合约...');
  
  // 先编译
  console.log('🔨 编译合约...');
  const compileProcess = spawn('npx', ['hardhat', 'compile'], {
    stdio: 'inherit',
    shell: true
  });

  await new Promise((resolve, reject) => {
    compileProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 合约编译成功');
        resolve();
      } else {
        reject(new Error(`编译失败，退出码: ${code}`));
      }
    });
  });

  // 再部署
  console.log('🚀 部署合约...');
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

async function runDiagnostics() {
  console.log('🔍 运行诊断检查...');
  const diagProcess = spawn('npx', ['hardhat', 'run', 'scripts/diagnose-contract.js', '--network', 'localhost'], {
    stdio: 'inherit',
    shell: true
  });

  await new Promise((resolve) => {
    diagProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 诊断检查通过\n');
      } else {
        console.log('⚠️  诊断检查发现问题，但继续启动\n');
      }
      resolve();
    });
  });
}

async function startDevelopment() {
  let nodeProcess = null;
  
  try {
    // 检查配置
    if (!checkHardhatConfig()) {
      console.log('\n❌ 请先修复Hardhat配置文件中的链ID设置');
      console.log('💡 运行以下命令修复:');
      console.log('   将 hardhat.config.cjs 中的 chainId: 1337 改为 chainId: 31337\n');
      process.exit(1);
    }

    // 清理现有进程
    await killExistingProcesses();

    // 启动 Hardhat 节点
    nodeProcess = await startHardhatNode();

    // 等待节点完全启动
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 部署合约（无论是否已部署，都重新部署以确保一致性）
    await deployContracts();

    // 运行诊断
    await runDiagnostics();

    // 启动前端开发服务器
    console.log('🌐 启动前端开发服务器...');
    const devProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    console.log('\n🎬 MovieWrite 开发环境已启动！');
    console.log('📱 前端地址: http://localhost:3000');
    console.log('⛓️  区块链网络: localhost:8545 (链ID: 31337)');
    console.log('\n💡 MetaMask 配置:');
    console.log('   网络名称: Hardhat Local');
    console.log('   RPC URL: http://127.0.0.1:8545');
    console.log('   链ID: 31337');
    console.log('   货币符号: ETH');
    console.log('\n🔑 测试账户私钥:');
    console.log('   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
    console.log('\n🎯 开始创建和参与电影文章！\n');

    // 处理进程退出
    process.on('SIGINT', () => {
      console.log('\n👋 正在关闭开发环境...');
      if (nodeProcess) nodeProcess.kill('SIGINT');
      devProcess.kill('SIGINT');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ 启动失败:', error.message);
    console.log('\n🔧 故障排除建议:');
    console.log('1. 检查端口8545是否被占用');
    console.log('2. 确保Node.js版本 >= 16');
    console.log('3. 运行 npm install 重新安装依赖');
    console.log('4. 查看 QUICK_FIX.md 获取详细解决方案');
    
    if (nodeProcess) nodeProcess.kill('SIGINT');
    process.exit(1);
  }
}

startDevelopment(); 