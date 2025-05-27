const fs = require('fs');
const { execSync } = require('child_process');

function simpleReset() {
  console.log("🔄 MovieWrite 简单重置");
  console.log("=" .repeat(40));
  
  try {
    // 1. 停止进程
    console.log("🔪 停止 Node.js 进程...");
    try {
      if (process.platform === 'win32') {
        execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
      } else {
        execSync('pkill -f node', { stdio: 'ignore' });
      }
      console.log("✅ 进程已停止");
    } catch (error) {
      console.log("ℹ️  没有找到运行中的进程");
    }

    // 2. 删除缓存文件夹
    console.log("🧹 清理缓存...");
    const foldersToDelete = ['.next', 'artifacts', 'cache'];
    
    foldersToDelete.forEach(folder => {
      if (fs.existsSync(folder)) {
        try {
          if (process.platform === 'win32') {
            execSync(`rmdir /s /q "${folder}"`, { stdio: 'ignore' });
          } else {
            execSync(`rm -rf "${folder}"`, { stdio: 'ignore' });
          }
          console.log(`✅ 删除: ${folder}`);
        } catch (error) {
          console.log(`⚠️  删除 ${folder} 失败`);
        }
      }
    });

    // 3. 删除合约地址文件
    console.log("📄 清理合约数据...");
    if (fs.existsSync('contract-addresses.json')) {
      try {
        fs.unlinkSync('contract-addresses.json');
        console.log("✅ 删除: contract-addresses.json");
      } catch (error) {
        console.log("⚠️  删除合约地址文件失败");
      }
    }

    // 4. 删除浏览器缓存提示文件
    if (fs.existsSync('BROWSER_CACHE_RESET.md')) {
      try {
        fs.unlinkSync('BROWSER_CACHE_RESET.md');
        console.log("✅ 删除旧的缓存提示文件");
      } catch (error) {
        // 忽略错误
      }
    }

    console.log("");
    console.log("🎉 重置完成!");
    console.log("=" .repeat(40));
    console.log("📋 接下来的步骤:");
    console.log("1. 运行: npm run quick-start");
    console.log("2. 如果需要重新导入账户: npm run keys");
    console.log("");
    console.log("💡 其他重置选项:");
    console.log("   npm run full-reset  - 完全重置(包括重装依赖)");
    console.log("");

  } catch (error) {
    console.error("❌ 重置失败:", error.message);
    console.log("");
    console.log("🔧 手动重置步骤:");
    console.log("1. 关闭所有终端");
    console.log("2. 删除 .next, artifacts, cache 文件夹");
    console.log("3. 删除 contract-addresses.json");
    console.log("4. 重新运行 npm run quick-start");
  }
}

simpleReset(); 