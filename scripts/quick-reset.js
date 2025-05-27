const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function killProcesses() {
  console.log("🔪 停止所有 Node.js 进程...");
  try {
    if (process.platform === 'win32') {
      await execAsync('taskkill /f /im node.exe', { timeout: 5000 });
    } else {
      await execAsync('pkill -f node', { timeout: 5000 });
    }
    console.log("✅ 所有 Node.js 进程已停止");
  } catch (error) {
    console.log("ℹ️  没有发现运行中的 Node.js 进程");
  }
}

async function quickCleanup() {
  console.log("🧹 快速清理缓存...");
  
  const pathsToDelete = [
    '.next',
    'artifacts',
    'cache'
  ];

  for (const pathToDelete of pathsToDelete) {
    try {
      if (fs.existsSync(pathToDelete)) {
        if (process.platform === 'win32') {
          await execAsync(`rmdir /s /q "${pathToDelete}"`, { timeout: 10000 });
        } else {
          await execAsync(`rm -rf "${pathToDelete}"`, { timeout: 10000 });
        }
        console.log(`✅ 删除: ${pathToDelete}`);
      }
    } catch (error) {
      console.log(`⚠️  删除 ${pathToDelete} 时出错: ${error.message}`);
    }
  }
}

async function clearContractData() {
  console.log("📄 清理合约数据...");
  
  if (fs.existsSync('contract-addresses.json')) {
    try {
      fs.unlinkSync('contract-addresses.json');
      console.log("✅ 删除: contract-addresses.json");
    } catch (error) {
      console.log(`⚠️  删除合约地址文件时出错: ${error.message}`);
    }
  }
}

async function quickReset() {
  console.log("⚡ MovieWrite 快速重置");
  console.log("=" .repeat(40));
  console.log("🚀 快速清理缓存和合约数据...");
  console.log("");

  try {
    // 1. 停止进程
    await killProcesses();
    await sleep(1000);

    // 2. 快速清理
    await quickCleanup();
    await sleep(500);

    // 3. 清理合约数据
    await clearContractData();
    await sleep(500);

    console.log("");
    console.log("🎉 快速重置完成!");
    console.log("=" .repeat(40));
    console.log("📋 接下来运行:");
    console.log("   npm run quick-start");
    console.log("");
    console.log("💡 如果遇到问题，运行完全重置:");
    console.log("   npm run full-reset");
    console.log("");

  } catch (error) {
    console.error("❌ 快速重置失败:", error);
    console.log("💡 建议运行完全重置: npm run full-reset");
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  quickReset();
}

module.exports = { quickReset }; 