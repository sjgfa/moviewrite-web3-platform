const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
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

async function clearCaches() {
  console.log("🧹 清理缓存和临时文件...");
  
  const pathsToDelete = [
    '.next',
    'node_modules/.cache',
    'artifacts',
    'cache',
    'typechain-types',
    '.hardhat_cache'
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
  console.log("📄 清理合约部署数据...");
  
  const filesToDelete = [
    'contract-addresses.json',
    'deployments.json'
  ];

  for (const file of filesToDelete) {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`✅ 删除: ${file}`);
      }
    } catch (error) {
      console.log(`⚠️  删除 ${file} 时出错: ${error.message}`);
    }
  }
}

async function resetNetworkPorts() {
  console.log("🌐 重置网络端口...");
  
  const ports = [3000, 3001, 8545];
  
  for (const port of ports) {
    try {
      if (process.platform === 'win32') {
        // Windows: 查找并杀死占用端口的进程
        try {
          const { stdout } = await execAsync(`netstat -ano | findstr :${port}`, { timeout: 5000 });
          if (stdout) {
            const lines = stdout.split('\n');
            for (const line of lines) {
              const parts = line.trim().split(/\s+/);
              if (parts.length > 4) {
                const pid = parts[parts.length - 1];
                if (pid && pid !== '0') {
                  try {
                    await execAsync(`taskkill /f /pid ${pid}`, { timeout: 3000 });
                    console.log(`✅ 释放端口 ${port} (PID: ${pid})`);
                  } catch (e) {
                    // 忽略错误，可能进程已经不存在
                  }
                }
              }
            }
          }
        } catch (e) {
          // 端口未被占用
        }
      } else {
        // Linux/Mac: 杀死占用端口的进程
        try {
          await execAsync(`lsof -ti:${port} | xargs kill -9`, { timeout: 5000 });
          console.log(`✅ 释放端口 ${port}`);
        } catch (e) {
          // 端口未被占用
        }
      }
    } catch (error) {
      console.log(`ℹ️  端口 ${port} 未被占用`);
    }
  }
}

async function clearBrowserCache() {
  console.log("🌐 清理浏览器相关缓存...");
  
  // 创建一个提示文件
  const cacheWarning = `
# 浏览器缓存清理提示

## MetaMask 重置步骤：
1. 打开 MetaMask 扩展
2. 设置 → 高级 → 重置账户
3. 删除所有导入的测试账户
4. 清除活动数据

## 浏览器缓存清理：
1. 按 F12 打开开发者工具
2. 右键点击刷新按钮
3. 选择 "清空缓存并硬性重新加载"
4. 或者按 Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

## 完全重置 Chrome：
1. 设置 → 隐私设置和安全性 → 清除浏览数据
2. 时间范围选择 "时间不限"
3. 勾选所有选项并清除

此文件在下次重置时会被删除。
`;

  fs.writeFileSync('BROWSER_CACHE_RESET.md', cacheWarning);
  console.log("✅ 创建浏览器缓存清理指南: BROWSER_CACHE_RESET.md");
}

async function reinstallDependencies() {
  console.log("📦 重新安装依赖...");
  
  try {
    // 删除 node_modules
    if (fs.existsSync('node_modules')) {
      console.log("🗑️  删除 node_modules...");
      if (process.platform === 'win32') {
        await execAsync('rmdir /s /q node_modules', { timeout: 30000 });
      } else {
        await execAsync('rm -rf node_modules', { timeout: 30000 });
      }
    }

    // 删除 package-lock.json
    if (fs.existsSync('package-lock.json')) {
      fs.unlinkSync('package-lock.json');
      console.log("✅ 删除 package-lock.json");
    }

    console.log("📥 重新安装依赖包...");
    await execAsync('npm install', { timeout: 120000 });
    console.log("✅ 依赖安装完成");
    
  } catch (error) {
    console.log("⚠️  依赖安装失败:", error.message);
    console.log("💡 请手动运行: npm install");
  }
}

async function fullReset() {
  console.log("🔄 MovieWrite 完全重置");
  console.log("=" .repeat(50));
  console.log("⚠️  警告: 这将清除所有数据和缓存!");
  console.log("");

  try {
    // 1. 停止所有进程
    await killProcesses();
    await sleep(2000);

    // 2. 清理网络端口
    await resetNetworkPorts();
    await sleep(1000);

    // 3. 清理缓存
    await clearCaches();
    await sleep(1000);

    // 4. 清理合约数据
    await clearContractData();
    await sleep(1000);

    // 5. 浏览器缓存提示
    await clearBrowserCache();
    await sleep(1000);

    // 6. 重新安装依赖
    await reinstallDependencies();

    console.log("");
    console.log("🎉 完全重置完成!");
    console.log("=" .repeat(50));
    console.log("📋 接下来的步骤:");
    console.log("1. 阅读 BROWSER_CACHE_RESET.md 清理浏览器缓存");
    console.log("2. 在 MetaMask 中重置账户和网络");
    console.log("3. 运行: npm run quick-start");
    console.log("4. 重新导入测试账户私钥");
    console.log("");
    console.log("💡 常用命令:");
    console.log("   npm run quick-start    - 快速启动");
    console.log("   npm run keys          - 查看私钥");
    console.log("   npm run accounts      - 查看账户");
    console.log("");

  } catch (error) {
    console.error("❌ 重置过程中出错:", error);
    console.log("");
    console.log("🔧 手动重置步骤:");
    console.log("1. 关闭所有终端窗口");
    console.log("2. 删除 .next、node_modules、artifacts 文件夹");
    console.log("3. 删除 contract-addresses.json 文件");
    console.log("4. 运行 npm install");
    console.log("5. 重新启动项目");
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  fullReset();
}

module.exports = { fullReset }; 