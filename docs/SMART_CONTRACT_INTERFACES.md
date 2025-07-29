# 📜 MovieWrite 智能合约接口文档

## 概述

MovieWrite 平台基于两个核心智能合约构建：
- **MovieArticle.sol**: 文章创作和贡献管理的主合约
- **RewardToken.sol**: ERC20代币合约，用于奖励机制

## 🎬 MovieArticle 合约

### 合约信息
- **合约名称**: MovieArticle
- **继承**: ERC721, Ownable, ReentrancyGuard
- **Token名称**: MovieArticleNFT (MANFT)
- **许可证**: MIT
- **Solidity版本**: ^0.8.20

### 状态变量

#### 核心计数器
```solidity
uint256 private _articleIds;        // 文章ID计数器
uint256 private _contributionIds;   // 贡献ID计数器
```

#### 核心映射
```solidity
mapping(uint256 => Article) public articles;                    // 文章映射
mapping(uint256 => Contribution) public contributions;           // 贡献映射
mapping(uint256 => uint256[]) public articleContributions;      // 文章->贡献ID数组
mapping(address => uint256[]) public userContributions;         // 用户->贡献ID数组
mapping(uint256 => mapping(address => bool)) public hasContributed;  // 文章->用户->是否已贡献
mapping(uint256 => mapping(address => bool)) public hasLiked;        // 贡献->用户->是否已点赞
```

#### 外部合约引用
```solidity
IERC20 public rewardToken;  // 奖励代币合约接口
```

### 数据结构

#### Article 结构体
```solidity
struct Article {
    uint256 id;                    // 文章唯一标识
    string title;                  // 文章标题
    string movieTitle;             // 电影名称
    string genre;                  // 电影类型
    address creator;               // 创建者地址
    uint256 createdAt;            // 创建时间戳
    uint256 totalContributions;   // 总贡献数
    uint256 totalRewards;         // 总奖励数量
    bool isCompleted;             // 是否已完成
    uint256 minContributionLength; // 最小贡献字数
    uint256 maxContributors;      // 最大贡献者数量
}
```

#### Contribution 结构体
```solidity
struct Contribution {
    uint256 id;          // 贡献唯一标识
    uint256 articleId;   // 所属文章ID
    address contributor; // 贡献者地址
    string content;      // 贡献内容
    uint256 timestamp;   // 贡献时间戳
    uint256 likes;       // 获得点赞数
    uint256 rewards;     // 获得奖励数量
    bool isApproved;     // 是否已审核通过
}
```

### 事件定义

```solidity
// 文章创建事件
event ArticleCreated(
    uint256 indexed articleId, 
    address indexed creator, 
    string title
);

// 贡献添加事件
event ContributionAdded(
    uint256 indexed contributionId, 
    uint256 indexed articleId, 
    address indexed contributor
);

// 贡献审核通过事件
event ContributionApproved(
    uint256 indexed contributionId, 
    uint256 reward
);

// 贡献被点赞事件
event ContributionLiked(
    uint256 indexed contributionId, 
    address indexed liker
);

// 文章完成事件
event ArticleCompleted(
    uint256 indexed articleId, 
    uint256 totalRewards
);

// 奖励分发事件
event RewardsDistributed(
    uint256 indexed articleId, 
    uint256 totalAmount
);
```

### 构造函数

```solidity
constructor(address _rewardToken) 
    ERC721("MovieArticleNFT", "MANFT") 
    Ownable(msg.sender) 
{
    rewardToken = IERC20(_rewardToken);
}
```

**参数**:
- `_rewardToken`: 奖励代币合约地址

### 公共函数

#### createArticle
创建新的电影文章项目

```solidity
function createArticle(
    string memory _title,
    string memory _movieTitle,
    string memory _genre,
    uint256 _minContributionLength,
    uint256 _maxContributors
) external returns (uint256)
```

**参数说明**:
- `_title`: 文章标题，描述文章主题
- `_movieTitle`: 电影名称，所分析的电影
- `_genre`: 电影类型（如：科幻、动作、剧情等）
- `_minContributionLength`: 单次贡献的最小字符数
- `_maxContributors`: 允许的最大贡献者数量

**返回值**: 新创建文章的ID

**触发事件**: `ArticleCreated`

**使用示例**:
```javascript
const tx = await movieArticle.createArticle(
    "《阿凡达》视觉效果分析",
    "Avatar",
    "科幻",
    100,  // 最少100字
    10    // 最多10个贡献者
);
```

#### addContribution
向指定文章添加贡献内容

```solidity
function addContribution(uint256 _articleId, string memory _content) external
```

**参数说明**:
- `_articleId`: 目标文章ID
- `_content`: 贡献内容文本

**前置条件**:
- 文章必须存在 (`_articleId <= _articleIds`)
- 文章未完成 (`!articles[_articleId].isCompleted`)
- 用户未对此文章贡献过 (`!hasContributed[_articleId][msg.sender]`)
- 内容长度符合要求 (`bytes(_content).length >= articles[_articleId].minContributionLength`)
- 贡献者数量未达上限 (`articles[_articleId].totalContributions < articles[_articleId].maxContributors`)

**触发事件**: `ContributionAdded`

**使用示例**:
```javascript
const tx = await movieArticle.addContribution(
    1,
    "阿凡达在视觉特效方面的突破性创新，特别是在3D技术和CGI角色塑造方面，为整个电影行业树立了新的标准..."
);
```

#### likeContribution
为贡献点赞

```solidity
function likeContribution(uint256 _contributionId) external
```

**参数说明**:
- `_contributionId`: 贡献ID

**前置条件**:
- 贡献必须存在 (`_contributionId <= _contributionIds`)
- 用户未点赞过 (`!hasLiked[_contributionId][msg.sender]`)
- 不能给自己的贡献点赞 (`contributions[_contributionId].contributor != msg.sender`)

**触发事件**: `ContributionLiked`

#### approveContribution (仅管理员)
审核批准贡献并分发奖励

```solidity
function approveContribution(uint256 _contributionId, uint256 _reward) external onlyOwner
```

**参数说明**:
- `_contributionId`: 贡献ID
- `_reward`: 奖励代币数量（以wei为单位）

**前置条件**:
- 贡献必须存在
- 贡献未曾被批准过

**功能**:
- 将贡献标记为已批准
- 记录奖励数量
- 更新文章总奖励
- 转账奖励代币给贡献者

**触发事件**: `ContributionApproved`

#### completeArticle (仅管理员)
完成文章并铸造NFT证书

```solidity
function completeArticle(uint256 _articleId) external onlyOwner
```

**参数说明**:
- `_articleId`: 文章ID

**前置条件**:
- 文章必须存在
- 文章未完成
- 文章至少有一个贡献

**功能**:
- 将文章标记为已完成
- 为文章创建者铸造NFT证书
- NFT的tokenId等于articleId

**触发事件**: `ArticleCompleted`

#### withdrawTokens (仅管理员)
提取合约中的代币

```solidity
function withdrawTokens(uint256 _amount) external onlyOwner
```

**参数说明**:
- `_amount`: 提取的代币数量

**功能**: 将指定数量的奖励代币转账给合约拥有者

### 查询函数

#### getTotalArticles
```solidity
function getTotalArticles() external view returns (uint256)
```
**返回**: 平台上创建的文章总数

#### getTotalContributions
```solidity
function getTotalContributions() external view returns (uint256)
```
**返回**: 平台上创建的贡献总数

#### getArticleContributions
```solidity
function getArticleContributions(uint256 _articleId) external view returns (uint256[] memory)
```
**返回**: 指定文章的所有贡献ID数组

#### getUserContributions
```solidity
function getUserContributions(address _user) external view returns (uint256[] memory)
```
**返回**: 指定用户的所有贡献ID数组

### Gas 消耗估算

| 函数名 | 预估Gas | 备注 |
|--------|---------|------|
| createArticle | ~150,000 | 包含存储操作 |
| addContribution | ~120,000 | 包含字符串存储 |
| likeContribution | ~45,000 | 简单状态更新 |
| approveContribution | ~80,000 | 包含代币转账 |
| completeArticle | ~100,000 | 包含NFT铸造 |

## 💰 RewardToken 合约

### 合约信息
- **合约名称**: RewardToken
- **继承**: ERC20, Ownable
- **许可证**: MIT
- **Solidity版本**: ^0.8.20

### 构造函数

```solidity
constructor(
    string memory name,
    string memory symbol,
    uint256 initialSupply,
    address initialOwner
) ERC20(name, symbol) Ownable(initialOwner)
```

**参数说明**:
- `name`: 代币名称（如 "MovieWrite Token"）
- `symbol`: 代币符号（如 "MWT"）
- `initialSupply`: 初始供应量
- `initialOwner`: 初始拥有者地址

**初始化**: 将全部初始供应量铸造给初始拥有者

### 主要函数

#### mint (仅管理员)
铸造新代币

```solidity
function mint(address to, uint256 amount) external onlyOwner
```

**参数说明**:
- `to`: 接收代币的地址
- `amount`: 铸造数量

**使用场景**: 增发奖励代币供应量

#### burn
销毁代币

```solidity
function burn(uint256 amount) external
```

**参数说明**:
- `amount`: 销毁数量

**功能**: 从调用者余额中销毁指定数量的代币

### 继承的ERC20函数

#### balanceOf
```solidity
function balanceOf(address account) external view returns (uint256)
```
查询指定地址的代币余额

#### transfer
```solidity
function transfer(address to, uint256 amount) external returns (bool)
```
转账代币到指定地址

#### approve
```solidity
function approve(address spender, uint256 amount) external returns (bool)
```
授权指定地址使用代币

#### transferFrom
```solidity
function transferFrom(address from, address to, uint256 amount) external returns (bool)
```
代理转账（需要预先授权）

## 🔧 部署配置

### 部署参数

#### RewardToken 部署参数
```javascript
const rewardTokenArgs = [
    "MovieWrite Token",           // 代币名称
    "MWT",                       // 代币符号
    ethers.parseEther("1000000"), // 初始供应量 1M
    deployer.address             // 初始拥有者
];
```

#### MovieArticle 部署参数
```javascript
const movieArticleArgs = [
    rewardTokenAddress  // 奖励代币合约地址
];
```

### 部署后配置

1. **转账奖励池**:
```javascript
// 将100K代币转给MovieArticle合约作为奖励池
await rewardToken.transfer(movieArticleAddress, ethers.parseEther("100000"));
```

2. **铸造测试代币**:
```javascript
// 为部署者铸造10K测试代币
await rewardToken.mint(deployer.address, ethers.parseEther("10000"));
```

## 🛡️ 安全特性

### 访问控制
- **onlyOwner**: 限制管理员功能（审核、完成文章、提取代币）
- **nonReentrant**: 防止重入攻击（奖励分发函数）

### 输入验证
- 存在性检查（文章、贡献必须存在）
- 状态检查（文章未完成、贡献未批准）
- 权限检查（不能重复贡献、不能自己点赞自己）
- 数量限制（最大贡献者、最小内容长度）

### 错误处理
所有函数都使用 `require` 语句进行前置条件检查，并提供清晰的错误信息：

```solidity
require(_articleId <= _articleIds, "Article does not exist");
require(!articles[_articleId].isCompleted, "Article is completed");
require(!hasContributed[_articleId][msg.sender], "You have already contributed to this article");
require(bytes(_content).length >= articles[_articleId].minContributionLength, "Content too short");
require(articles[_articleId].totalContributions < articles[_articleId].maxContributors, "Max contributors reached");
```

## 📊 事件索引

### 监听事件示例

```javascript
// 监听文章创建
movieArticle.on("ArticleCreated", (articleId, creator, title) => {
    console.log(`新文章创建: ${title} by ${creator}`);
});

// 监听贡献添加
movieArticle.on("ContributionAdded", (contributionId, articleId, contributor) => {
    console.log(`新贡献: ${contributionId} -> 文章 ${articleId}`);
});

// 监听贡献批准
movieArticle.on("ContributionApproved", (contributionId, reward) => {
    console.log(`贡献批准: ${contributionId}, 奖励: ${ethers.formatEther(reward)} MWT`);
});
```

## 🔍 常见用法模式

### 创建文章流程
```javascript
// 1. 连接合约
const movieArticle = new ethers.Contract(address, abi, signer);

// 2. 创建文章
const tx = await movieArticle.createArticle(
    "《星际穿越》科学性分析",
    "Interstellar", 
    "科幻",
    150,  // 最少150字
    8     // 最多8人参与
);

// 3. 等待确认
const receipt = await tx.wait();
const articleId = receipt.logs[0].args[0]; // 从事件中提取文章ID
```

### 贡献和奖励流程
```javascript
// 1. 添加贡献
await movieArticle.addContribution(articleId, contributionContent);

// 2. 其他用户点赞
await movieArticle.connect(otherUser).likeContribution(contributionId);

// 3. 管理员批准并奖励（需要管理员权限）
await movieArticle.approveContribution(
    contributionId, 
    ethers.parseEther("100") // 100 MWT奖励
);

// 4. 文章完成和NFT铸造
await movieArticle.completeArticle(articleId);
```

## 📋 升级建议

### V2 潜在功能
- **分级奖励系统**: 根据贡献质量分级奖励
- **投票机制**: 社区投票决定贡献质量
- **时间锁**: 防止抢跑攻击
- **多重签名**: 增强管理员操作安全性
- **暂停功能**: 紧急情况下暂停合约操作

### 优化方向
- **Gas优化**: 减少存储操作，优化数据结构
- **批量操作**: 支持批量审核、批量奖励
- **链下存储**: 将大文本内容存储到IPFS
- **代理模式**: 实现合约升级能力

---

💡 **提示**: 在与智能合约交互时，始终注意Gas费用和交易确认时间。建议在主网部署前在测试网充分测试所有功能。