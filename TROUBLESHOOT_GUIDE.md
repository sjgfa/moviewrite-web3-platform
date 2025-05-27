# 🔧 MovieWrite 故障排除指南

## 🚨 常见问题及解决方案

### 1. Circuit Breaker 错误

**错误**: `Execution prevented because the circuit breaker is open`

**原因**: 合约部署有问题或网络状态不正确

**解决方案**:
```bash
# 完全重新启动（推荐）
npm run fresh-restart

# 或者手动步骤：
npm run kill:node
npx hardhat clean
npx hardhat compile
npx hardhat node &
npx hardhat run scripts/deploy-and-setup.js --network localhost
npm run dev
```

### 2. 合约调用返回空数据

**错误**: `could not decode result data (value="0x")`

**原因**: 
- 合约未正确部署
- 网络重启后合约数据丢失
- 合约地址不匹配

**解决方案**:
```bash
# 检查合约状态
npm run diagnose

# 重新部署合约
npx hardhat run scripts/deploy-and-setup.js --network localhost

# 如果还有问题，完全重启
npm run fresh-restart
```

### 3. 图标导入错误

**错误**: `Element type is invalid: expected a string but got: undefined`

**原因**: CrownIcon 不存在于 heroicons 包中

**解决方案**:
```bash
# 自动修复图标问题
npm run admin:fix
```

### 4. 端口占用问题

**错误**: `Port 3000/8545 is already in use`

**解决方案**:
```bash
# Windows 杀死端口进程
netstat -ano | findstr :3000
taskkill /PID <PID> /F

netstat -ano | findstr :8545  
taskkill /PID <PID> /F

# 或者使用我们的脚本
npm run kill:node
```

### 5. MetaMask 连接问题

**问题**: 无法连接到本地网络

**解决方案**:
1. **添加本地网络**:
   - 网络名称: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - 链ID: 31337
   - 货币符号: ETH

2. **导入测试账户**:
   ```
   管理员账户: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   私钥: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

3. **切换网络**: 确保MetaMask选择了Hardhat Local网络

## 🛠 诊断工具

### 快速诊断
```bash
npm run diagnose
```

### 检查账户
```bash
npm run accounts
```

### 检查奖励系统
```bash
npm run rewards
```

### 修复hydration错误
```bash
npm run fix-hydration
```

## 🚀 启动选项

### 1. 推荐启动（自动处理大多数问题）
```bash
npm run fresh-restart
```

### 2. 快速启动（如果环境已配置）
```bash
npm run quick-start
```

### 3. 管理员启动
```bash
npm run admin
```

### 4. 简单启动（仅前端）
```bash
npm run admin:simple
```

### 5. 开发启动
```bash
npm run start:dev
```

## 📋 完整重置步骤

如果所有方法都失败了，按以下步骤完全重置：

```bash
# 1. 停止所有进程
taskkill /f /im node.exe

# 2. 清理所有缓存
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules\.cache

# 3. 重新安装依赖（如果需要）
npm install

# 4. 完全重启
npm run fresh-restart
```

## 🔍 日志检查

### 查看Hardhat节点日志
- 检查8545端口是否启动
- 查看合约部署地址
- 确认交易是否成功

### 查看浏览器控制台
- 检查JavaScript错误
- 查看网络请求状态
- 确认钱包连接状态

### 查看终端输出
- 编译错误信息
- 部署脚本输出
- 网络启动状态

## 🆘 最终解决方案

如果问题依然存在：

1. **重新克隆项目** (如果可能)
2. **重新安装Node.js** (确保版本 >= 16)
3. **重新安装MetaMask** 
4. **检查防火墙设置** (确保端口3000和8545未被阻止)
5. **以管理员权限运行PowerShell**

## 📞 获取帮助

```bash
# 查看所有可用命令
npm run help

# 查看版本信息
node --version
npm --version
npx hardhat --version
```

---

**记住**: 大多数问题都可以通过 `npm run fresh-restart` 解决！ 🎯 