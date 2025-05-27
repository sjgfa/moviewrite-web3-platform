# 🚀 MovieWrite 启动指南

## ⚡ 一键启动（推荐）

### 方法1：快速启动
```bash
npm run quick-start
```
这是最简单的方法，会自动：
- ✅ 检查配置
- ✅ 编译合约
- ✅ 启动Hardhat节点
- ✅ 部署合约
- ✅ 启动前端服务器

### 方法2：完整启动
```bash
npm run start:dev
```
功能更全面，包含：
- ✅ 配置检查和修复
- ✅ 进程清理
- ✅ 诊断检查
- ✅ 详细的启动信息

## 🔧 其他有用命令

### 诊断问题
```bash
npm run diagnose
```
检查合约部署状态和网络连接

### 重启项目
```bash
npm run restart
```
清理所有进程和缓存，然后手动运行启动命令

### 查看账户
```bash
npm run accounts
```
显示所有测试账户和私钥

### 获取测试代币
```bash
npm run mint
```
为指定地址铸造测试代币

## 📱 MetaMask 配置

启动成功后，在MetaMask中添加网络：

```
网络名称: Hardhat Local
RPC URL: http://127.0.0.1:8545
链ID: 31337
货币符号: ETH
```

## 🔑 测试账户

导入第一个测试账户私钥到MetaMask：
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## 🌐 访问应用

启动完成后访问：
- **前端应用**: http://localhost:3000
- **区块链节点**: http://127.0.0.1:8545

## ❌ 常见问题

### 问题1：端口被占用
```bash
npm run kill:node
```

### 问题2：合约调用失败
```bash
npm run diagnose
```
查看具体错误信息

### 问题3：链ID不匹配
确保MetaMask中的链ID是 `31337`，不是 `1337`

### 问题4：完全重启
```bash
npm run restart
npm run quick-start
```

## 🎯 成功标志

当看到以下信息时，说明启动成功：
- ✅ "Hardhat节点已启动"
- ✅ "合约部署成功"
- ✅ "前端服务器启动"
- ✅ 浏览器能正常访问 localhost:3000
- ✅ MetaMask能连接到Hardhat Local网络

## 💡 提示

1. **首次使用**：推荐使用 `npm run quick-start`
2. **开发调试**：使用 `npm run start:dev` 获取更多信息
3. **遇到问题**：先运行 `npm run diagnose` 检查状态
4. **完全重置**：使用 `npm run restart` 然后重新启动

---

**享受Web3电影文章创作之旅！** 🎬✨ 