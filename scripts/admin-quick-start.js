const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("👑 MovieWrite 管理员快速启动");
console.log("============================");

async function checkAndStartServices() {
  try {
    // 1. 检查合约是否已部署
    const contractAddressesPath = path.join(__dirname, '../contract-addresses.json');
    if (!fs.existsSync(contractAddressesPath)) {
      console.log("❌ 合约未部署，需要先部署合约");
      console.log("🔧 运行: npm run quick-start");
      return false;
    }

    const contractAddresses = JSON.parse(fs.readFileSync(contractAddressesPath, 'utf8'));
    console.log("✅ 发现已部署的合约");
    console.log(`📄 MovieArticle: ${contractAddresses.movieArticle}`);
    console.log(`🪙 RewardToken: ${contractAddresses.rewardToken}`);

    // 2. 检查网络是否运行
    try {
      execSync('curl -s http://localhost:8545 -X POST -H "Content-Type: application/json" --data \'{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}\'', { stdio: 'ignore' });
      console.log("✅ Hardhat网络正在运行");
    } catch (error) {
      console.log("❌ Hardhat网络未运行，正在启动...");
      
      // 启动 Hardhat 节点
      const hardhatProcess = spawn('npx', ['hardhat', 'node'], {
        stdio: 'pipe',
        shell: true
      });

      // 等待网络启动
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          hardhatProcess.kill();
          reject(new Error("网络启动超时"));
        }, 30000);

        hardhatProcess.stdout.on('data', (data) => {
          const output = data.toString();
          if (output.includes('Started HTTP and WebSocket JSON-RPC server')) {
            clearTimeout(timeout);
            console.log("✅ Hardhat网络启动成功");
            resolve();
          }
        });

        hardhatProcess.stderr.on('data', (data) => {
          console.error('网络错误:', data.toString());
        });
      });
    }

    // 3. 检查并分配奖励
    console.log("\n🎁 检查待审批贡献...");
    try {
      execSync('npm run rewards', { stdio: 'inherit' });
    } catch (error) {
      console.log("ℹ️  奖励分配完成或无待处理项目");
    }

    // 4. 启动前端应用
    console.log("\n🚀 启动管理员面板...");
    const nextProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    console.log("\n✅ 管理员服务启动完成！");
    console.log("============================");
    console.log("🌐 管理员面板: http://localhost:3000/admin");
    console.log("📱 用户界面: http://localhost:3000");
    console.log("🔗 区块链网络: http://localhost:8545");
    console.log("\n💡 管理员功能:");
    console.log("   - 审批贡献并分配奖励");
    console.log("   - 完成文章并铸造NFT");
    console.log("   - 查看平台统计数据");
    console.log("   - 管理文章状态");

    console.log("\n⚠️  重要提示:");
    console.log("   - 只有合约部署者账户可以访问管理员面板");
    console.log("   - 确保在MetaMask中使用正确的管理员账户");
    console.log("   - 管理员账户地址会在界面中显示");

    // 保持进程运行
    process.on('SIGINT', () => {
      console.log('\n👋 正在关闭服务...');
      nextProcess.kill();
      process.exit(0);
    });

    return true;

  } catch (error) {
    console.error("❌ 启动失败:", error.message);
    console.log("\n🔧 故障排除:");
    console.log("1. 确保端口8545和3000未被占用");
    console.log("2. 运行: npm install");
    console.log("3. 检查合约是否正确部署");
    return false;
  }
}

// 显示管理员账户信息
async function showAdminInfo() {
  try {
    console.log("\n👤 管理员账户信息:");
    execSync('npm run accounts', { stdio: 'inherit' });
  } catch (error) {
    console.log("ℹ️  无法显示账户信息，服务启动后可在界面中查看");
  }
}

async function main() {
  const success = await checkAndStartServices();
  if (success) {
    await showAdminInfo();
  }
}

main().catch(console.error); 