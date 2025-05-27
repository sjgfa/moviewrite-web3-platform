const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('⚡ MovieWrite 快速启动脚本\n');

// 简单的配置检查
function quickCheck() {
  console.log('🔍 快速检查配置...');
  
  // 检查hardhat配置
  try {
    const configPath = path.join(__dirname, '../hardhat.config.cjs');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    if (configContent.includes('chainId: 31337')) {
      console.log('✅ Hardhat配置正确');
    } else {
      console.log('❌ Hardhat配置需要修复 (链ID应为31337)');
      return false;
    }
  } catch (error) {
    console.log('❌ 无法读取配置文件');
    return false;
  }

  // 检查必要文件
  const requiredFiles = [
    'contracts/MovieArticle.sol',
    'contracts/RewardToken.sol',
    'scripts/deploy-and-setup.js'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(__dirname, '..', file))) {
      console.log(`❌ 缺少文件: ${file}`);
      return false;
    }
  }

  console.log('✅ 所有必要文件存在');
  return true;
}

async function runCommand(command, args, description) {
  console.log(`🔄 ${description}...`);
  
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '..')
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description}完成`);
        resolve();
      } else {
        console.log(`❌ ${description}失败 (退出码: ${code})`);
        reject(new Error(`${description}失败`));
      }
    });
  });
}

async function quickStart() {
  try {
    // 快速检查
    if (!quickCheck()) {
      console.log('\n❌ 配置检查失败，请先修复配置');
      console.log('💡 查看 QUICK_FIX.md 获取修复指南');
      process.exit(1);
    }

    console.log('\n🚀 开始快速启动...\n');

    // 1. 编译合约
    await runCommand('npx', ['hardhat', 'compile'], '编译智能合约');

    // 2. 启动节点（后台）
    console.log('\n🔗 启动Hardhat节点...');
    const nodeProcess = spawn('npx', ['hardhat', 'node'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    // 等待节点启动
    await new Promise((resolve, reject) => {
      let nodeReady = false;
      
      nodeProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Started HTTP and WebSocket JSON-RPC server') && !nodeReady) {
          nodeReady = true;
          console.log('✅ Hardhat节点已启动');
          resolve();
        }
      });

      setTimeout(() => {
        if (!nodeReady) {
          reject(new Error('节点启动超时'));
        }
      }, 15000);
    });

    // 等待节点稳定
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. 部署合约
    await runCommand('npx', ['hardhat', 'run', 'scripts/deploy-and-setup.js', '--network', 'localhost'], '部署智能合约');

    // 4. 启动前端
    console.log('\n🌐 启动前端服务器...');
    const devProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    console.log('\n🎉 启动完成！');
    console.log('\n📋 服务信息:');
    console.log('  🌐 前端: http://localhost:3000');
    console.log('  ⛓️  区块链: http://127.0.0.1:8545');
    console.log('  🆔 链ID: 31337');
    console.log('\n💡 MetaMask设置:');
    console.log('  网络名称: Hardhat Local');
    console.log('  RPC URL: http://127.0.0.1:8545');
    console.log('  链ID: 31337');
    console.log('  货币符号: ETH');
    console.log('\n🔑 测试私钥:');
    console.log('  0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');

    // 处理退出
    process.on('SIGINT', () => {
      console.log('\n👋 关闭服务...');
      nodeProcess.kill('SIGINT');
      devProcess.kill('SIGINT');
      process.exit(0);
    });

  } catch (error) {
    console.error('\n❌ 启动失败:', error.message);
    console.log('\n🔧 建议:');
    console.log('1. 检查端口8545是否被占用');
    console.log('2. 运行: npm install');
    console.log('3. 查看: QUICK_FIX.md');
    process.exit(1);
  }
}

quickStart(); 