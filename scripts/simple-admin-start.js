const { spawn } = require('child_process');

console.log("👑 简单管理员启动");
console.log("==================");

async function simpleStart() {
  try {
    // 直接启动前端，假设Hardhat节点已经在运行
    console.log("🚀 启动管理员面板...");
    
    const nextProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    console.log("\n✅ 管理员面板启动中...");
    console.log("🌐 管理员面板: http://localhost:3000/admin");
    console.log("📱 用户界面: http://localhost:3000");
    
    console.log("\n💡 重要提示:");
    console.log("- 确保Hardhat节点在端口8545运行");
    console.log("- 使用管理员账户 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    console.log("- 如果遇到合约错误，运行: npm run fresh-restart");

    // 保持进程运行
    process.on('SIGINT', () => {
      console.log('\n👋 正在关闭服务...');
      nextProcess.kill();
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ 启动失败:", error.message);
    console.log("🔧 建议运行: npm run fresh-restart");
  }
}

simpleStart(); 