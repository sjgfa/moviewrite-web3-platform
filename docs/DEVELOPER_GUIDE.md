# 🛠️ MovieWrite 开发者指南

## 目录
- [环境准备](#环境准备)
- [项目架构](#项目架构)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [测试指南](#测试指南)
- [部署流程](#部署流程)
- [故障排除](#故障排除)

## 🚀 环境准备

### 系统要求
- **Node.js**: v18.0+ (推荐 v20.x)
- **npm**: v8.0+ 或 **yarn**: v1.22+
- **Git**: v2.30+
- **MetaMask**: 浏览器扩展

### 开发工具推荐
- **IDE**: VS Code + Solidity 扩展
- **终端**: Windows Terminal / iTerm2
- **浏览器**: Chrome/Firefox + MetaMask

### 环境变量配置

创建 `.env.local` 文件：
```bash
# 网络配置
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545

# 可选：部署到测试网
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
POLYGON_URL=https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 🏗️ 项目架构

### 目录结构详解
```
moviewrite-web3-platform/
├── contracts/                 # 智能合约
│   ├── MovieArticle.sol      # 核心业务合约
│   └── RewardToken.sol       # ERC20 代币合约
├── scripts/                   # 部署和管理脚本
│   ├── deploy-and-setup.js  # 一键部署脚本
│   ├── start-dev.js         # 开发环境启动
│   └── admin-quick-start.js # 管理员工具
├── test/                     # 测试文件
│   └── MovieArticle.test.js # 合约单元测试
├── pages/                    # Next.js 页面
│   ├── _app.js              # 应用入口
│   ├── index.js             # 首页
│   ├── articles.js          # 文章列表
│   ├── profile.js           # 用户中心
│   └── api/                 # API 路由
├── components/               # React 组件
│   ├── Layout.js            # 全局布局
│   ├── ArticleCard.js       # 文章卡片
│   └── CreateArticleModal.js # 创建弹窗
├── lib/                     # 工具库
│   └── web3.js             # Web3 配置
├── styles/                  # 样式文件
│   └── globals.css         # 全局样式
└── docs/                    # 文档目录
    ├── API_DOCUMENTATION.md
    └── DEVELOPER_GUIDE.md
```

### 技术栈详解

#### 前端技术栈
```javascript
// Next.js 14 - React 全栈框架
// React 18 - UI 库
// Tailwind CSS 3 - 样式框架
// Framer Motion - 动画库
// RainbowKit - 钱包连接
// Wagmi - Web3 React Hooks
// React Query - 状态管理
```

#### 区块链技术栈
```solidity
// Solidity ^0.8.20 - 智能合约语言
// Hardhat - 开发框架
// OpenZeppelin - 安全合约库
// Ethers.js v6 - 以太坊交互
// Chai - 测试断言库
```

## 💻 开发流程

### 1. 项目初始化
```bash
# 克隆项目
git clone <repository-url>
cd moviewrite-web3-platform

# 安装依赖
npm install

# 初始化开发环境
npm run quick-start
```

### 2. 本地开发启动
```bash
# 方案一：一键启动（推荐）
npm run start:dev

# 方案二：分步启动
npm run node      # 启动本地区块链
npm run deploy    # 部署合约
npm run dev       # 启动前端
```

### 3. 开发工作流

#### 智能合约开发
```bash
# 1. 编辑合约文件
# contracts/MovieArticle.sol
# contracts/RewardToken.sol

# 2. 编译合约
npm run compile

# 3. 运行测试
npm run test

# 4. 部署到本地网络
npm run deploy:local

# 5. 验证部署
npm run diagnose
```

#### 前端开发
```bash
# 1. 启动开发服务器
npm run dev

# 2. 实时重载开发
# 修改 pages/, components/, lib/ 下的文件

# 3. 样式开发
# 使用 Tailwind CSS 类名
# 修改 styles/globals.css

# 4. 组件测试
# 浏览器中测试功能
```

### 4. Git 工作流
```bash
# 创建功能分支
git checkout -b feature/new-functionality

# 提交更改
git add .
git commit -m "feat: add new functionality"

# 推送分支
git push origin feature/new-functionality

# 创建 Pull Request
```

## 📋 代码规范

### JavaScript/React 规范

#### 组件命名
```javascript
// ✅ 好的命名
const ArticleCard = ({ title, author }) => {
  return <div>{title} by {author}</div>;
};

// ❌ 不好的命名
const card = ({ t, a }) => {
  return <div>{t} by {a}</div>;
};
```

#### Hooks 使用
```javascript
// ✅ 正确使用
const [loading, setLoading] = useState(false);
const { data, error } = useContractRead({
  address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
  abi: MOVIE_ARTICLE_ABI,
  functionName: 'getTotalArticles',
});

// ✅ 自定义 Hook
const useArticleData = (articleId) => {
  const [article, setArticle] = useState(null);
  // Hook 逻辑
  return { article, loading, error };
};
```

#### 错误处理
```javascript
// ✅ 完整的错误处理
const createArticle = async (formData) => {
  try {
    setLoading(true);
    const tx = await write({
      args: [
        formData.title,
        formData.movieTitle,
        formData.genre,
        formData.minLength,
        formData.maxContributors
      ]
    });
    
    toast.success('文章创建成功！');
    return tx;
  } catch (error) {
    console.error('创建文章失败:', error);
    toast.error(`创建失败: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
```

### Solidity 规范

#### 合约结构
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MovieArticle is ERC721, Ownable {
    // 1. 状态变量
    uint256 private _articleIds;
    mapping(uint256 => Article) public articles;
    
    // 2. 事件
    event ArticleCreated(uint256 indexed articleId, address indexed creator);
    
    // 3. 修饰符
    modifier onlyValidArticle(uint256 _articleId) {
        require(_articleId <= _articleIds, "Article does not exist");
        _;
    }
    
    // 4. 构造函数
    constructor() ERC721("MovieArticleNFT", "MANFT") Ownable(msg.sender) {}
    
    // 5. 外部函数
    // 6. 公共函数
    // 7. 内部函数
    // 8. 私有函数
}
```

#### 安全最佳实践
```solidity
// ✅ 使用 ReentrancyGuard
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

function approveContribution(uint256 _contributionId, uint256 _reward) 
    external 
    onlyOwner 
    nonReentrant 
{
    // 检查-效果-交互模式
    require(_contributionId <= _contributionIds, "Contribution does not exist");
    require(!contributions[_contributionId].isApproved, "Already approved");
    
    // 状态更改
    contributions[_contributionId].isApproved = true;
    contributions[_contributionId].rewards = _reward;
    
    // 外部交互
    if (_reward > 0) {
        rewardToken.transfer(contributions[_contributionId].contributor, _reward);
    }
}
```

### 样式规范

#### Tailwind CSS 最佳实践
```jsx
// ✅ 响应式设计
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  
// ✅ 组件化样式
const buttonStyles = "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors";

// ✅ 条件样式
<div className={`
  px-4 py-2 rounded-lg text-sm font-medium
  ${isCompleted 
    ? 'bg-green-100 text-green-800' 
    : 'bg-blue-100 text-blue-800'
  }
`}>
```

## 🧪 测试指南

### 单元测试

#### 智能合约测试
```javascript
// test/MovieArticle.test.js
describe("MovieArticle", function () {
  let movieArticle, rewardToken, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // 部署测试合约
    const RewardToken = await ethers.getContractFactory("RewardToken");
    rewardToken = await RewardToken.deploy("MovieReward", "MRT", ethers.parseEther("1000000"), owner.address);
    
    const MovieArticle = await ethers.getContractFactory("MovieArticle");
    movieArticle = await MovieArticle.deploy(await rewardToken.getAddress());
  });

  it("Should create a new article", async function () {
    await expect(
      movieArticle.createArticle("Test Title", "Test Movie", "Drama", 50, 5)
    ).to.emit(movieArticle, "ArticleCreated");
  });
});
```

#### 前端组件测试（建议）
```javascript
// __tests__/components/ArticleCard.test.js
import { render, screen } from '@testing-library/react';
import ArticleCard from '@/components/ArticleCard';

describe('ArticleCard', () => {
  const mockProps = {
    id: '1',
    title: 'Test Article',
    movieTitle: 'Test Movie',
    genre: '科幻',
    creator: '0x123...',
    totalContributions: 5,
    isCompleted: false
  };

  it('renders article information correctly', () => {
    render(<ArticleCard {...mockProps} />);
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });
});
```

### 集成测试

#### 端到端测试流程
```bash
# 1. 启动测试环境
npm run node          # 终端1：启动本地链
npm run deploy        # 终端2：部署合约
npm run dev           # 终端3：启动前端

# 2. 手动测试流程
# - 连接MetaMask到本地网络
# - 创建新文章
# - 添加贡献
# - 点赞功能
# - 奖励分发
# - NFT铸造
```

### 测试命令
```bash
# 运行合约测试
npm run test

# 运行特定测试文件
npx hardhat test test/MovieArticle.test.js

# 运行测试并查看gas报告
npx hardhat test --reporter gas-reporter

# 运行覆盖率测试
npm run coverage
```

## 🚀 部署流程

### 本地部署
```bash
# 一键部署（推荐）
npm run deploy

# 手动部署
npx hardhat compile
npx hardhat run scripts/deploy-and-setup.js --network localhost
```

### 测试网部署

#### Sepolia 测试网
```bash
# 1. 配置环境变量
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key

# 2. 部署到Sepolia
npx hardhat run scripts/deploy-and-setup.js --network sepolia

# 3. 验证合约
npx hardhat verify --network sepolia CONTRACT_ADDRESS "Constructor Arg 1" "Constructor Arg 2"
```

#### Polygon 主网
```bash
# 1. 配置环境变量
POLYGON_URL=https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_mainnet_private_key

# 2. 部署到Polygon
npx hardhat run scripts/deploy-and-setup.js --network polygon

# 3. 更新前端配置
# 修改 lib/web3.js 中的网络配置
```

### 部署检查清单
- [ ] 合约编译成功
- [ ] 测试通过
- [ ] 网络配置正确
- [ ] 私钥安全设置
- [ ] Gas费用充足
- [ ] 合约验证完成
- [ ] 前端配置更新

## 🔧 故障排除

### 常见问题

#### 1. Hydration 错误
```bash
# 症状: React hydration mismatch
# 解决方案:
npm run fix-hydration

# 或手动修复
# 确保使用 mounted 状态检查
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <div>Loading...</div>;
```

#### 2. 合约连接失败
```bash
# 症状: Contract not deployed
# 解决方案:
npm run diagnose          # 检查合约状态
npm run test-contract     # 测试合约连接
npm run deploy           # 重新部署
```

#### 3. MetaMask 连接问题
```bash
# 症状: MetaMask 无法连接
# 解决方案:
1. 检查网络配置 (localhost:8545, Chain ID: 31337)
2. 重置MetaMask账户
3. 导入测试私钥
4. 清除浏览器缓存
```

#### 4. 端口占用问题
```bash
# 症状: Port 3000/8545 already in use
# 解决方案:
npm run kill:node        # 杀死Node进程
netstat -ano | findstr :3000  # 查找占用进程
taskkill /PID <PID> /F   # 强制结束进程
```

### 调试工具

#### 开发者工具
```bash
# 查看账户信息
npm run accounts

# 查看私钥
npm run keys

# 检查合约状态
npm run diagnose

# 测试代币铸造
npm run mint

# 自动奖励分发
npm run rewards
```

#### 日志调试
```javascript
// 智能合约事件监听
useContractEvent({
  address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
  abi: MOVIE_ARTICLE_ABI,
  eventName: 'ArticleCreated',
  listener: (logs) => {
    console.log('文章创建事件:', logs);
  },
});

// 交易状态跟踪
const { write, isLoading, isSuccess, error } = useContractWrite({
  ...config,
  onSettled: (data, error) => {
    console.log('交易完成:', { data, error });
  },
});
```

## 📚 学习资源

### 官方文档
- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [Solidity 文档](https://docs.soliditylang.org)
- [Hardhat 文档](https://hardhat.org/docs)
- [OpenZeppelin 文档](https://docs.openzeppelin.com)

### 社区资源
- [Ethereum 开发者文档](https://ethereum.org/developers)
- [Web3 University](https://www.web3.university)
- [CryptoZombies](https://cryptozombies.io)

### 项目相关
- [RainbowKit 文档](https://www.rainbowkit.com/docs)
- [Wagmi 文档](https://wagmi.sh)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

## 🔄 版本管理

### Git 分支策略
```
main              # 主分支 - 生产环境
├── develop       # 开发分支 - 集成环境
├── feature/*     # 功能分支
├── hotfix/*      # 热修复分支
└── release/*     # 发布分支
```

### 语义化版本控制
```
v1.0.0 - 主要版本.次要版本.补丁版本
- 主要版本: 不兼容的API更改
- 次要版本: 向后兼容的功能添加
- 补丁版本: 向后兼容的错误修复
```

## 🎯 最佳实践

### 性能优化
1. **React 优化**
   - 使用 React.memo 缓存组件
   - 实现虚拟列表处理大数据
   - 懒加载非关键组件

2. **Web3 优化**
   - 批量RPC调用减少请求
   - 使用事件监听实时更新
   - 合理设置轮询间隔

3. **合约优化**
   - 优化存储布局减少gas
   - 使用事件记录重要信息
   - 实现批量操作接口

### 安全建议
1. **智能合约安全**
   - 使用OpenZeppelin库
   - 实现访问控制
   - 防止重入攻击

2. **前端安全**
   - 验证所有用户输入
   - 安全地处理私钥
   - 使用HTTPS连接

3. **部署安全**
   - 妥善保管私钥
   - 使用多重签名钱包
   - 定期安全审计

---

💡 **提示**: 遇到问题时，首先查看控制台错误信息，然后参考本指南的故障排除部分。如需更多帮助，请查看项目的 Issue 页面。