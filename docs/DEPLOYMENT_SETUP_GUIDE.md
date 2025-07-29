# 🚀 MovieWrite 部署和设置指南

## 概述

本指南详细介绍了MovieWrite平台在不同环境下的部署流程，包括本地开发、测试网部署和主网部署。

## 📋 部署前准备

### 系统要求
- **Node.js**: v18.0+ (推荐 v20.x)
- **npm**: v8.0+ 或 **yarn**: v1.22+
- **Git**: v2.30+
- **操作系统**: Windows 10+, macOS 12+, Ubuntu 20.04+

### 必需工具
- **MetaMask**: 浏览器扩展钱包
- **代码编辑器**: VS Code (推荐) + Solidity扩展
- **终端工具**: Windows Terminal, iTerm2 等

### 环境变量配置

创建 `.env.local` 文件：
```bash
# 本地开发配置
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545

# 测试网配置（可选）
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
POLYGON_MUMBAI_URL=https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID

# 主网配置（生产环境）
POLYGON_URL=https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID
ETHEREUM_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# 私钥（测试网和主网）
PRIVATE_KEY=your_private_key_here

# API密钥
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

## 🏠 本地开发部署

### 方案一：一键启动（推荐）

#### 1. 项目初始化
```bash
# 克隆项目
git clone <repository-url>
cd moviewrite-web3-platform

# 安装依赖
npm install
```

#### 2. 一键启动
```bash
# 启动完整开发环境
npm run quick-start
```

这个命令会自动：
- 🔄 启动Hardhat本地区块链节点
- 📜 编译和部署智能合约
- 🎨 启动Next.js前端开发服务器
- ⚙️ 配置合约地址和ABI
- 🪙 铸造测试代币

#### 3. 验证部署
```bash
# 检查部署状态
npm run diagnose

# 查看账户信息
npm run accounts

# 测试合约连接
npm run test-contract
```

### 方案二：分步部署

#### 1. 启动区块链节点
```bash
# 终端1：启动Hardhat节点
npm run node
```

保持该终端运行，输出类似：
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### 2. 编译和部署合约
```bash
# 终端2：编译合约
npm run compile

# 部署到本地网络
npm run deploy
```

部署输出示例：
```
Deploying contracts with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

RewardToken deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
MovieArticle deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

✅ 合约部署成功！
✅ 配置文件已更新：contract-addresses.json
✅ 奖励池设置完成：100,000 MWT
✅ 测试代币铸造完成：10,000 MWT
```

#### 3. 启动前端服务
```bash
# 终端3：启动前端
npm run dev
```

前端启动后访问：http://localhost:3000

#### 4. 配置MetaMask

1. **添加本地网络**：
   - 网络名称: `Localhost 8545`
   - RPC URL: `http://localhost:8545`
   - 链ID: `31337`
   - 货币符号: `ETH`

2. **导入测试账户**：
   ```
   私钥: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   地址: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   ```

### 开发工具和脚本

```bash
# 开发实用脚本
npm run diagnose      # 诊断合约状态
npm run accounts      # 显示所有测试账户
npm run keys          # 显示私钥（仅开发用）
npm run mint         # 铸造测试代币
npm run rewards       # 自动分发奖励
npm run test         # 运行合约测试

# 清理和重置
npm run clean        # 安全清理
npm run reset        # 完整重置
npm run full-reset   # 彻底重置
```

## 🧪 测试网部署

### Sepolia 测试网部署

#### 1. 获取测试ETH
- 访问 [Sepolia Faucet](https://sepoliafaucet.com/)
- 输入你的钱包地址获取测试ETH

#### 2. 配置环境
```bash
# .env.local
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_sepolia_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

#### 3. 部署合约
```bash
# 编译合约
npm run compile

# 部署到Sepolia
npx hardhat run scripts/deploy-and-setup.js --network sepolia
```

#### 4. 验证合约
```bash
# 验证RewardToken合约
npx hardhat verify --network sepolia REWARD_TOKEN_ADDRESS "MovieWrite Token" "MWT" "1000000000000000000000000" "DEPLOYER_ADDRESS"

# 验证MovieArticle合约
npx hardhat verify --network sepolia MOVIE_ARTICLE_ADDRESS REWARD_TOKEN_ADDRESS
```

#### 5. 更新前端配置
```javascript
// lib/web3.js
const sepoliaChain = {
  id: 11155111,
  name: 'Sepolia',
  network: 'sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://sepolia.infura.io/v3/YOUR_PROJECT_ID'] },
    default: { http: ['https://sepolia.infura.io/v3/YOUR_PROJECT_ID'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
};
```

### Polygon Mumbai 测试网

#### 1. 获取测试MATIC
- 访问 [Mumbai Faucet](https://faucet.polygon.technology/)
- 选择Mumbai网络和MATIC代币

#### 2. 配置和部署
```bash
# .env.local
POLYGON_MUMBAI_URL=https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# 部署
npx hardhat run scripts/deploy-and-setup.js --network polygonMumbai
```

## 🌐 主网部署

### Polygon 主网部署

#### 1. 安全准备
- ⚠️ **安全第一**: 确保私钥安全存储
- 💰 **资金准备**: 钱包中有足够的MATIC支付Gas费
- 🧪 **测试验证**: 所有功能在测试网验证完毕
- 📋 **代码审计**: 智能合约代码经过安全审计

#### 2. 主网配置
```bash
# .env.local (生产环境)
POLYGON_URL=https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_mainnet_private_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# 安全检查
NODE_ENV=production
```

#### 3. 部署步骤
```bash
# 1. 最终编译
npm run compile

# 2. 运行测试确保代码正确
npm run test

# 3. 部署到Polygon主网
npx hardhat run scripts/deploy-and-setup.js --network polygon

# 4. 验证合约
npx hardhat verify --network polygon CONTRACT_ADDRESS ...args
```

#### 4. 生产环境配置
```javascript
// lib/web3.js - 生产配置
const polygonChain = {
  id: 137,
  name: 'Polygon',
  network: 'polygon',
  nativeCurrency: {
    decimals: 18,
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcUrls: {
    public: { http: ['https://polygon-rpc.com'] },
    default: { http: ['https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID'] },
  },
  blockExplorers: {
    default: { name: 'PolygonScan', url: 'https://polygonscan.com' },
  },
};
```

### Ethereum 主网部署

#### 1. 高Gas费准备
- 💸 **Gas费预估**: 准备足够的ETH (通常需要0.1-0.5 ETH)
- ⏰ **最佳时机**: 选择Gas价格较低的时段部署
- 🔍 **Gas追踪**: 使用 [ETH Gas Station](https://ethgasstation.info/) 监控

#### 2. 部署配置
```bash
# .env.local
ETHEREUM_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_mainnet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

#### 3. 分步部署策略
```bash
# 1. 首先部署RewardToken（Gas费较低）
npx hardhat run scripts/deploy-token-only.js --network mainnet

# 2. 验证Token合约
npx hardhat verify --network mainnet TOKEN_ADDRESS ...args

# 3. 部署MovieArticle合约
npx hardhat run scripts/deploy-article-only.js --network mainnet

# 4. 验证Article合约
npx hardhat verify --network mainnet ARTICLE_ADDRESS TOKEN_ADDRESS
```

## 🔄 CI/CD 部署

### GitHub Actions 配置

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Compile contracts
        run: npm run compile

  deploy-testnet:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Deploy to Sepolia
        run: npx hardhat run scripts/deploy-and-setup.js --network sepolia
        env:
          SEPOLIA_URL: ${{ secrets.SEPOLIA_URL }}
          PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}

  deploy-mainnet:
    needs: test
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Deploy to Polygon
        run: npx hardhat run scripts/deploy-and-setup.js --network polygon
        env:
          POLYGON_URL: ${{ secrets.POLYGON_URL }}
          PRIVATE_KEY: ${{ secrets.MAINNET_PRIVATE_KEY }}
```

### Secrets 配置
在GitHub仓库设置中添加以下Secrets：
- `SEPOLIA_URL`
- `POLYGON_URL`
- `PRIVATE_KEY` (测试网)
- `MAINNET_PRIVATE_KEY` (主网)
- `ETHERSCAN_API_KEY`
- `POLYGONSCAN_API_KEY`

## 🔒 安全最佳实践

### 私钥管理
```bash
# ❌ 错误：直接在代码中硬编码
const privateKey = "0xac0974bec39a...";

# ✅ 正确：使用环境变量
const privateKey = process.env.PRIVATE_KEY;

# ✅ 更安全：使用硬件钱包
const wallet = new ethers.Wallet(privateKey, provider);
```

### 合约安全检查
```bash
# 运行安全检查工具
npm install -g mythril
myth analyze contracts/MovieArticle.sol

# 或使用Slither
pip install slither-analyzer
slither contracts/
```

### 多重签名部署
```javascript
// 使用Gnosis Safe进行多重签名部署
const safeAddress = "0x..."; // Gnosis Safe地址
const safe = new ethers.Contract(safeAddress, safeABI, signer);

// 提交部署交易给多重签名钱包
const tx = await safe.submitTransaction(
  deploymentAddress,
  0,
  deploymentData
);
```

## 📊 部署验证清单

### 部署前检查
- [ ] 代码审计完成
- [ ] 所有测试通过
- [ ] 环境变量配置正确
- [ ] 钱包资金充足
- [ ] 网络配置验证
- [ ] Gas价格合理

### 部署后验证
- [ ] 合约地址记录
- [ ] 合约验证成功
- [ ] 前端配置更新
- [ ] 功能测试通过
- [ ] 事件监听正常
- [ ] 文档更新完成

### 监控设置
- [ ] 合约事件监听
- [ ] 错误日志收集
- [ ] 性能指标监控
- [ ] 用户行为分析
- [ ] 安全告警设置

## 🚨 故障排除

### 常见部署问题

#### 1. Gas费用不足
```bash
# 错误信息
Error: insufficient funds for gas * price + value

# 解决方案
# 1. 检查钱包余额
# 2. 调整Gas价格
# 3. 分批部署合约
```

#### 2. 网络连接问题
```bash
# 错误信息
Error: network connection timeout

# 解决方案
# 1. 检查RPC URL
# 2. 更换RPC提供商
# 3. 增加超时时间
```

#### 3. 合约验证失败
```bash
# 错误信息
Error: Contract verification failed

# 解决方案
# 1. 检查构造函数参数
# 2. 确认编译器版本
# 3. 检查导入路径
```

#### 4. 前端连接问题
```bash
# 症状：MetaMask无法连接合约
# 解决方案：
# 1. 检查合约地址配置
# 2. 验证ABI文件
# 3. 确认网络配置
# 4. 重启前端服务
```

### 调试工具

#### 合约调试
```bash
# Hardhat console
npx hardhat console --network polygon

# Node.js环境中测试
const contract = await ethers.getContractAt("MovieArticle", contractAddress);
const totalArticles = await contract.getTotalArticles();
console.log("Total articles:", totalArticles.toString());
```

#### 前端调试
```javascript
// 浏览器控制台调试
console.log("Contract Address:", CONTRACT_ADDRESSES.MOVIE_ARTICLE);
console.log("Chain ID:", window.ethereum.chainId);
console.log("Connected Account:", account);

// React Developer Tools
// 检查组件状态和Props
```

## 📈 扩展部署

### 多链部署策略

#### 1. 链选择标准
- **用户群体**: 目标用户主要使用的链
- **Gas费用**: 交易成本对用户体验的影响
- **生态系统**: DeFi和NFT生态的发展程度
- **技术成熟度**: 链的稳定性和开发工具支持

#### 2. 推荐部署顺序
1. **Polygon**: 低Gas费，优秀的用户体验
2. **Ethereum**: 最大的用户群体和生态
3. **BSC**: 活跃的亚洲市场
4. **Arbitrum**: Ethereum L2，更低费用
5. **Optimism**: 另一个流行的L2解决方案

#### 3. 跨链配置
```javascript
// lib/web3.js - 多链配置
const chains = [
  polygonChain,
  ethereumChain,
  arbitrumChain,
  optimismChain
];

// 动态合约地址
const CONTRACT_ADDRESSES = {
  [137]: { // Polygon
    MOVIE_ARTICLE: "0x...",
    REWARD_TOKEN: "0x..."
  },
  [1]: { // Ethereum
    MOVIE_ARTICLE: "0x...",
    REWARD_TOKEN: "0x..."
  }
};
```

### IPFS集成部署

```javascript
// 集成IPFS存储长文本内容
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from('projectId:projectSecret').toString('base64')}`
  }
});

// 存储文章内容到IPFS
const addToIPFS = async (content) => {
  const result = await ipfs.add(content);
  return result.path; // 返回IPFS哈希
};
```

---

💡 **提示**: 在生产环境部署前，建议进行全面的安全审计和压力测试。部署完成后，持续监控合约的运行状态和用户反馈，及时处理可能出现的问题。