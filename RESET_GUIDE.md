# 🔄 MovieWrite 重置命令指南

当你遇到问题需要重新开始时，可以使用以下重置命令：

## 📋 重置命令对比

### 🛡️ 安全重置 (推荐)
```bash
npm run reset
# 或
npm run clean
```
**功能：**
- ✅ 删除缓存文件夹 (.next, artifacts, cache)
- ✅ 删除合约地址文件 (contract-addresses.json)
- ✅ 清理临时文件
- ✅ 清理 node_modules 缓存
- 🛡️ **不会停止当前进程**
- ⏱️ 快速完成 (~5秒)

### ⚡ 快速重置
```bash
npm run quick-reset
```
**功能：**
- ❌ 尝试停止进程 (可能导致脚本中断)
- ✅ 删除缓存文件
- ✅ 删除合约数据
- ⚠️ 可能不稳定

### 🔄 完全重置 (最彻底)
```bash
npm run full-reset
```
**功能：**
- 🔪 停止所有 Node.js 进程
- 🌐 释放网络端口 (3000, 3001, 8545)
- 🧹 删除所有缓存和临时文件
- 📦 **重新安装所有依赖**
- 📄 创建浏览器缓存清理指南
- ⏱️ 较慢 (~2-5分钟)

## 🚀 使用流程

### 日常重置 (推荐)
```bash
# 1. 安全重置
npm run reset

# 2. 手动关闭其他终端中的进程

# 3. 重新启动
npm run quick-start

# 4. 查看账户私钥 (如需要)
npm run keys
```

### 彻底重置 (遇到严重问题时)
```bash
# 1. 完全重置
npm run full-reset

# 2. 根据提示清理浏览器缓存

# 3. 重置 MetaMask
#    - 设置 → 高级 → 重置账户
#    - 删除所有测试账户

# 4. 重新启动
npm run quick-start

# 5. 重新导入账户
npm run keys
```

## 🔧 手动重置步骤

如果所有命令都失败，可以手动重置：

### Windows:
```powershell
# 1. 关闭所有终端窗口

# 2. 删除文件夹
Remove-Item -Recurse -Force .next, artifacts, cache -ErrorAction SilentlyContinue

# 3. 删除文件
Remove-Item contract-addresses.json -ErrorAction SilentlyContinue

# 4. 重新安装依赖 (可选)
npm install

# 5. 重新启动
npm run quick-start
```

### Linux/Mac:
```bash
# 1. 关闭所有终端

# 2. 删除文件
rm -rf .next artifacts cache contract-addresses.json

# 3. 重新安装依赖 (可选)
npm install

# 4. 重新启动
npm run quick-start
```

## 🎯 常见问题解决

### 问题1: 端口被占用
```bash
# Windows
netstat -ano | findstr :8545
taskkill /f /pid <PID>

# Linux/Mac
lsof -ti:8545 | xargs kill -9
```

### 问题2: 合约地址错误
```bash
npm run reset
npm run quick-start
```

### 问题3: MetaMask 连接问题
1. MetaMask → 设置 → 高级 → 重置账户
2. 删除 Hardhat Local 网络
3. 重新添加网络 (localhost:8545, 链ID: 31337)
4. 重新导入账户私钥

### 问题4: 浏览器缓存问题
1. 按 F12 打开开发者工具
2. 右键点击刷新按钮
3. 选择 "清空缓存并硬性重新加载"

## 📱 MetaMask 完全重置

如果需要完全重置 MetaMask：

1. **删除所有账户**
   - 逐个删除所有导入的测试账户

2. **重置账户数据**
   - 设置 → 高级 → 重置账户
   - 确认重置

3. **删除自定义网络**
   - 删除 "Hardhat Local" 网络

4. **重新设置**
   - 添加网络: localhost:8545, 链ID: 31337
   - 导入管理员账户: `npm run keys`

## 💡 最佳实践

1. **优先使用安全重置**: `npm run reset`
2. **遇到严重问题才用完全重置**: `npm run full-reset` 
3. **重置后记得重新导入账户**: `npm run keys`
4. **定期清理浏览器缓存**
5. **保存重要的测试数据截图**

## ⚡ 快速命令参考

```bash
npm run reset        # 安全重置 (推荐)
npm run full-reset   # 完全重置
npm run quick-start  # 重新启动
npm run keys         # 查看私钥
npm run accounts     # 查看账户余额
npm run diagnose     # 诊断问题
``` 