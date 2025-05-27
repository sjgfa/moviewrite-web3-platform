const fs = require('fs');
const { execSync } = require('child_process');

function safeReset() {
  console.log("🔄 MovieWrite 安全重置");
  console.log("=" .repeat(40));
  console.log("🛡️  不会停止当前进程，只清理文件和缓存");
  console.log("");
  
  try {
    // 1. 删除缓存文件夹
    console.log("🧹 清理缓存文件夹...");
    const foldersToDelete = ['.next', 'artifacts', 'cache', 'typechain-types'];
    
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
          console.log(`⚠️  删除 ${folder} 失败: ${error.message}`);
        }
      } else {
        console.log(`ℹ️  ${folder} 不存在，跳过`);
      }
    });

    // 2. 删除合约地址文件
    console.log("📄 清理合约数据文件...");
    const filesToDelete = ['contract-addresses.json', 'deployments.json'];
    
    filesToDelete.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
          console.log(`✅ 删除: ${file}`);
        } catch (error) {
          console.log(`⚠️  删除 ${file} 失败: ${error.message}`);
        }
      } else {
        console.log(`ℹ️  ${file} 不存在，跳过`);
      }
    });

    // 3. 删除临时文件
    console.log("🗑️  清理临时文件...");
    const tempFiles = ['BROWSER_CACHE_RESET.md', 'QUICK_FIX.md'];
    
    tempFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
          console.log(`✅ 删除: ${file}`);
        } catch (error) {
          console.log(`⚠️  删除 ${file} 失败`);
        }
      }
    });

    // 4. 清理 node_modules 缓存(但不删除整个文件夹)
    console.log("📦 清理 Node.js 缓存...");
    if (fs.existsSync('node_modules/.cache')) {
      try {
        if (process.platform === 'win32') {
          execSync('rmdir /s /q "node_modules\\.cache"', { stdio: 'ignore' });
        } else {
          execSync('rm -rf "node_modules/.cache"', { stdio: 'ignore' });
        }
        console.log("✅ 删除: node_modules/.cache");
      } catch (error) {
        console.log("⚠️  清理 node_modules 缓存失败");
      }
    }

    console.log("");
    console.log("🎉 安全重置完成!");
    console.log("=" .repeat(40));
    console.log("📋 接下来的步骤:");
    console.log("1. 🛑 手动关闭其他终端中的 Hardhat 节点");
    console.log("2. 🛑 手动关闭其他终端中的 Next.js 开发服务器");
    console.log("3. 🚀 运行: npm run quick-start");
    console.log("4. 🔑 如果需要账户信息: npm run keys");
    console.log("");
    console.log("💡 其他重置选项:");
    console.log("   npm run full-reset    - 完全重置(包括重装依赖)");
    console.log("   npm run clean         - 同 reset");
    console.log("");
    console.log("🔧 如果仍有问题:");
    console.log("1. 关闭所有终端窗口");
    console.log("2. 重新打开终端");
    console.log("3. 再次运行 npm run quick-start");
    console.log("");

  } catch (error) {
    console.error("❌ 重置失败:", error.message);
    console.log("");
    console.log("🔧 手动重置步骤:");
    console.log("1. 手动删除文件夹: .next, artifacts, cache");
    console.log("2. 手动删除文件: contract-addresses.json");
    console.log("3. 关闭所有终端，重新启动");
    console.log("4. 运行: npm run quick-start");
  }
}

safeReset(); 