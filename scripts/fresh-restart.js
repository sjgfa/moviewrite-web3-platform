const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("🔄 MovieWrite 完全重新启动");
console.log("=============================");

async function fullRestart() {
  try {
    // 1. 清理所有缓存和临时文件
    console.log("🧹 清理缓存和临时文件...");
    try {
      execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
    } catch (e) {
      // 忽略错误，可能没有运行的进程
    }
    
    // 清理Next.js缓存
    const nextPath = path.join(__dirname, '../.next');
    if (fs.existsSync(nextPath)) {
      fs.rmSync(nextPath, { recursive: true, force: true });
      console.log("✅ 清理 .next 缓存");
    }

    // 清理node_modules缓存
    const nodeModulesCachePath = path.join(__dirname, '../node_modules/.cache');
    if (fs.existsSync(nodeModulesCachePath)) {
      fs.rmSync(nodeModulesCachePath, { recursive: true, force: true });
      console.log("✅ 清理 node_modules 缓存");
    }

    // 2. 重新编译合约
    console.log("\n🔄 重新编译合约...");
    execSync('npx hardhat clean', { stdio: 'inherit' });
    execSync('npx hardhat compile', { stdio: 'inherit' });

    // 3. 启动新的Hardhat节点
    console.log("\n🔗 启动全新的Hardhat节点...");
    const hardhatProcess = spawn('npx', ['hardhat', 'node'], {
      stdio: 'pipe',
      shell: true
    });

    // 等待节点启动
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        hardhatProcess.kill();
        reject(new Error("节点启动超时"));
      }, 30000);

      hardhatProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);
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

    // 等待一秒确保网络完全启动
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. 重新部署合约
    console.log("\n📄 重新部署合约...");
    execSync('npx hardhat run scripts/deploy-and-setup.js --network localhost', { stdio: 'inherit' });

    // 5. 验证部署
    console.log("\n🔍 验证合约部署...");
    const contractAddressesPath = path.join(__dirname, '../contract-addresses.json');
    if (fs.existsSync(contractAddressesPath)) {
      const addresses = JSON.parse(fs.readFileSync(contractAddressesPath, 'utf8'));
      console.log("✅ 合约地址文件已更新:");
      console.log(`   MovieArticle: ${addresses.movieArticle}`);
      console.log(`   RewardToken: ${addresses.rewardToken}`);
    }

    // 6. 启动前端
    console.log("\n🚀 启动前端应用...");
    const nextProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    console.log("\n🎉 完全重启成功！");
    console.log("==============================");
    console.log("🌐 应用地址: http://localhost:3000");
    console.log("👑 管理员面板: http://localhost:3000/admin");
    console.log("🔗 区块链网络: http://localhost:8545");
    
    console.log("\n💡 管理员账户信息:");
    console.log("   地址: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    console.log("   这是合约部署者，可以访问管理员面板");
    
    console.log("\n🔧 下一步:");
    console.log("1. 在MetaMask中连接到localhost:8545网络");
    console.log("2. 导入管理员账户私钥");
    console.log("3. 开始创建文章和管理平台");

    // 保持进程运行
    process.on('SIGINT', () => {
      console.log('\n👋 正在关闭服务...');
      hardhatProcess.kill();
      nextProcess.kill();
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ 重启失败:", error.message);
    console.log("\n🔧 故障排除建议:");
    console.log("1. 确保端口8545和3000未被其他程序占用");
    console.log("2. 检查是否有足够的磁盘空间");
    console.log("3. 尝试以管理员权限运行PowerShell");
    console.log("4. 重新安装依赖: npm install");
  }
}

fullRestart(); 