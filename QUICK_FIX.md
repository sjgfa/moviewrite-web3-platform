# 🚨 Web3项目错误修复指南

## 问题1: 链ID不匹配
"自定义网络返回的链 ID 与提交的链 ID 不匹配"

## 问题2: 合约函数调用失败
"ContractFunctionExecutionError: getTotalContributions returned no data"

## 问题3: Hydration错误 🆕
"Hydration failed because the initial UI does not match"

## 问题4: WalletConnect错误 🆕
"WebSocket connection closed abnormally" / "401 Unauthorized"

## ✅ 完整解决方案

### 1. 一键修复（新增）
```bash
npm run fix-all
```
这会自动修复所有常见问题

### 2. 修复MetaMask配置

**在MetaMask中手动添加网络：**

```
网络名称: Hardhat Local
RPC URL: http://127.0.0.1:8545
链ID: 31337
货币符号: ETH
```

### 3. 完全重启项目（重要！）

**步骤1 - 停止所有进程：**
- 关闭所有终端窗口
- 在任务管理器中结束所有node.exe进程

**步骤2 - 清理缓存：**
```bash
# 删除.next目录（如果存在）
rmdir /s .next

# 清理npm缓存
npm cache clean --force
```

**步骤3 - 按顺序重启（3个新终端）：**

**终端1 - 启动Hardhat节点：**
```bash
npx hardhat node
```
等待看到"Started HTTP and WebSocket JSON-RPC server"

**终端2 - 重新编译和部署：**
```bash
npx hardhat compile
npx hardhat run scripts/deploy-and-setup.js --network localhost
```
等待看到合约地址输出

**终端3 - 启动前端：**
```bash
npm run dev
```

### 4. 创建环境文件 🆕

在项目根目录创建 `.env.local` 文件：
```bash
# Next.js Configuration
NEXT_PUBLIC_ENABLE_TESTNETS=true
NEXT_PUBLIC_PROJECT_ID=local-development
NEXT_PUBLIC_CHAIN_ID=31337

# Hardhat Configuration
HARDHAT_NETWORK=localhost
HARDHAT_RPC_URL=http://127.0.0.1:8545
```

### 5. 验证修复

**检查合约部署：**
```bash
# 在新终端运行
npx hardhat run scripts/diagnose-contract.js --network localhost
```

**检查前端：**
1. 访问 `http://localhost:3000`
2. 打开浏览器开发者工具
3. 连接MetaMask钱包
4. 检查控制台是否还有错误

### 6. 导入测试账户

**私钥（仅用于测试）：**
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**在MetaMask中导入：**
1. 点击账户图标 → "导入账户"
2. 粘贴私钥
3. 确认导入

## 🔧 已修复的配置

- ✅ Hardhat配置：链ID从1337改为31337
- ✅ 前端配置：使用标准wagmi链配置
- ✅ 网络配置：localhost和hardhat都使用31337
- ✅ 合约部署：确保在正确的网络上部署
- ✅ Hydration修复：添加客户端挂载检查 🆕
- ✅ WalletConnect修复：简化钱包配置 🆕

## 🚨 常见错误原因

### ContractFunctionExecutionError的原因：
1. **合约未部署** - 最常见原因
2. **网络不匹配** - 前端连接的网络与合约部署的网络不同
3. **合约地址错误** - contract-addresses.json中的地址不正确
4. **ABI不匹配** - 编译的ABI与部署的合约不匹配

### 链ID不匹配的原因：
1. **Hardhat配置错误** - 使用了1337而不是31337
2. **MetaMask网络配置错误** - 链ID设置不正确
3. **缓存问题** - 旧的配置被缓存

### Hydration错误的原因：🆕
1. **服务端渲染不匹配** - 客户端和服务端HTML不一致
2. **Web3状态在SSR时未定义** - 钱包连接状态在服务端为空
3. **自动连接配置** - autoConnect在SSR时引起问题

### WalletConnect错误的原因：🆕
1. **无效的项目ID** - 示例ID在生产环境无效
2. **网络连接问题** - 无法连接到WalletConnect服务
3. **版本兼容性** - RainbowKit版本与WalletConnect不兼容

## 🔍 故障排除

### 如果合约调用仍然失败：

1. **检查Hardhat节点是否运行：**
   ```bash
   curl http://127.0.0.1:8545 -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

2. **检查合约是否部署：**
   ```bash
   npx hardhat run scripts/diagnose-contract.js --network localhost
   ```

3. **重新生成ABI：**
   ```bash
   npx hardhat compile --force
   ```

### 如果Hydration错误仍然存在：🆕

1. **清理所有缓存：**
   ```bash
   npm run clean
   rm -rf .swc
   ```

2. **检查浏览器缓存：**
   - 清除localhost:3000的所有数据
   - 禁用浏览器缓存（F12 > Network > Disable cache）

3. **重新安装依赖：**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### 如果MetaMask连接失败：

1. **重置MetaMask：**
   - 设置 → 高级 → 重置账户

2. **清除浏览器缓存：**
   - 清除localhost:3000的所有数据

3. **重新添加网络：**
   - 删除现有的Hardhat Local网络
   - 重新添加（确保链ID是31337）

## 📝 成功标志

当一切正常时，你应该看到：
- ✅ Hardhat节点运行在端口8545
- ✅ 合约成功部署并显示地址
- ✅ 前端运行在端口3000
- ✅ MetaMask显示"Hardhat Local"网络
- ✅ 页面显示文章数量和贡献数量
- ✅ 无控制台错误（特别是hydration错误）🆕
- ✅ 钱包连接正常，无WalletConnect错误 🆕

## 📞 快速命令参考 🆕

```bash
# 一键修复所有问题
npm run fix-all

# 快速启动（推荐）
npm run quick-start

# 诊断问题
npm run diagnose

# 清理和重启
npm run restart

# 查看帮助
npm run help
```

## 📞 最后手段

如果所有方法都失败：

1. **完全重新开始：**
   ```bash
   # 备份重要文件
   copy contract-addresses.json contract-addresses.backup
   
   # 删除所有生成的文件
   rmdir /s artifacts cache .next node_modules
   
   # 重新安装
   npm install
   
   # 重新开始
   npm run node
   npm run deploy
   npm run dev
   ```

---

**注意**：确保按照确切的顺序执行步骤，不要跳过任何步骤！新增的修复措施专门解决hydration和WalletConnect问题。 