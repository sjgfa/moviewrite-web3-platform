# 📚 MovieWrite API 文档

## 概述

MovieWrite 平台提供完整的 RESTful API 和智能合约接口，支持电影文章协作创作的所有核心功能。

## 🌐 REST API 接口

### 基础信息
- **基础URL**: `http://localhost:3000/api`
- **内容类型**: `application/json`
- **认证方式**: 无需传统认证（使用Web3钱包签名）

### 文章相关接口

#### 获取文章详情
```http
GET /api/article/[id]
```

**参数**:
- `id` (string): 文章ID

**响应示例**:
```json
{
  "id": "1",
  "title": "《黑暗骑士》深度解析",
  "movieTitle": "The Dark Knight", 
  "genre": "动作",
  "creator": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "createdAt": "1672531200",
  "totalContributions": 5,
  "totalRewards": "500000000000000000000",
  "isCompleted": false,
  "minContributionLength": 100,
  "maxContributors": 10,
  "contributions": [
    {
      "id": "1",
      "contributor": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "content": "诺兰在这部电影中展现了超凡的叙事能力...",
      "timestamp": "1672534800",
      "likes": 3,
      "rewards": "100000000000000000000",
      "isApproved": true
    }
  ]
}
```

**错误响应**:
```json
{
  "error": "Article not found",
  "code": 404
}
```

#### 获取贡献详情
```http
GET /api/contribution/[id]
```

**参数**:
- `id` (string): 贡献ID

**响应示例**:
```json
{
  "id": "1",
  "articleId": "1",
  "contributor": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "content": "这是一篇关于电影分析的优质贡献内容...",
  "timestamp": "1672534800",
  "likes": 5,
  "rewards": "100000000000000000000",
  "isApproved": true,
  "article": {
    "title": "《黑暗骑士》深度解析",
    "movieTitle": "The Dark Knight"
  }
}
```

## 🔗 智能合约接口

### MovieArticle 合约

#### 合约地址
- **本地开发**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **网络**: Localhost (Chain ID: 31337)

#### 主要函数

##### createArticle
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

**参数**:
- `_title`: 文章标题
- `_movieTitle`: 电影名称
- `_genre`: 电影类型
- `_minContributionLength`: 最小贡献字数
- `_maxContributors`: 最大贡献者数量

**返回**: 新创建文章的ID

**事件**: `ArticleCreated(uint256 indexed articleId, address indexed creator, string title)`

##### addContribution
向文章添加贡献内容

```solidity
function addContribution(uint256 _articleId, string memory _content) external
```

**参数**:
- `_articleId`: 文章ID
- `_content`: 贡献内容

**限制条件**:
- 文章必须存在且未完成
- 用户不能重复贡献同一文章
- 内容长度必须达到最小要求
- 贡献者数量不能超过上限

**事件**: `ContributionAdded(uint256 indexed contributionId, uint256 indexed articleId, address indexed contributor)`

##### likeContribution
为贡献点赞

```solidity
function likeContribution(uint256 _contributionId) external
```

**参数**:
- `_contributionId`: 贡献ID

**限制条件**:
- 贡献必须存在
- 不能重复点赞
- 不能为自己的贡献点赞

**事件**: `ContributionLiked(uint256 indexed contributionId, address indexed liker)`

##### approveContribution (仅管理员)
审核批准贡献并分发奖励

```solidity
function approveContribution(uint256 _contributionId, uint256 _reward) external onlyOwner
```

**参数**:
- `_contributionId`: 贡献ID
- `_reward`: 奖励数量 (wei单位)

**事件**: `ContributionApproved(uint256 indexed contributionId, uint256 reward)`

##### completeArticle (仅管理员)
完成文章并铸造NFT

```solidity
function completeArticle(uint256 _articleId) external onlyOwner
```

**参数**:
- `_articleId`: 文章ID

**功能**:
- 将文章标记为已完成
- 为文章创建者铸造NFT证书
- 触发文章完成事件

**事件**: `ArticleCompleted(uint256 indexed articleId, uint256 totalRewards)`

#### 查询函数

##### getTotalArticles
```solidity
function getTotalArticles() external view returns (uint256)
```
返回平台上文章的总数

##### getTotalContributions  
```solidity
function getTotalContributions() external view returns (uint256)
```
返回平台上贡献的总数

##### getArticleContributions
```solidity
function getArticleContributions(uint256 _articleId) external view returns (uint256[] memory)
```
返回指定文章的所有贡献ID数组

##### getUserContributions
```solidity
function getUserContributions(address _user) external view returns (uint256[] memory)
```
返回指定用户的所有贡献ID数组

#### 数据结构

##### Article 结构体
```solidity
struct Article {
    uint256 id;
    string title;
    string movieTitle;
    string genre;
    address creator;
    uint256 createdAt;
    uint256 totalContributions;
    uint256 totalRewards;
    bool isCompleted;
    uint256 minContributionLength;
    uint256 maxContributors;
}
```

##### Contribution 结构体
```solidity
struct Contribution {
    uint256 id;
    uint256 articleId;
    address contributor;
    string content;
    uint256 timestamp;
    uint256 likes;
    uint256 rewards;
    bool isApproved;
}
```

### RewardToken 合约

#### 合约地址
- **本地开发**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **代币符号**: MWT
- **代币名称**: MovieWrite Token

#### 主要函数

##### mint (仅管理员)
```solidity
function mint(address to, uint256 amount) external onlyOwner
```
铸造新的代币到指定地址

##### burn
```solidity
function burn(uint256 amount) external
```
销毁调用者持有的代币

##### 标准ERC20函数
- `balanceOf(address account)`: 查询余额
- `transfer(address to, uint256 amount)`: 转账
- `approve(address spender, uint256 amount)`: 授权
- `transferFrom(address from, address to, uint256 amount)`: 代理转账

## 🔧 前端集成示例

### 使用 Wagmi Hooks

#### 读取合约数据
```javascript
import { useContractRead } from 'wagmi';
import { CONTRACT_ADDRESSES, MOVIE_ARTICLE_ABI } from '@/lib/web3';

// 获取文章总数
const { data: totalArticles } = useContractRead({
  address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
  abi: MOVIE_ARTICLE_ABI,
  functionName: 'getTotalArticles',
});

// 获取文章信息
const { data: article } = useContractRead({
  address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
  abi: MOVIE_ARTICLE_ABI,
  functionName: 'articles',
  args: [articleId],
});
```

#### 写入合约数据
```javascript
import { useContractWrite, usePrepareContractWrite } from 'wagmi';

// 准备交易
const { config } = usePrepareContractWrite({
  address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
  abi: MOVIE_ARTICLE_ABI,
  functionName: 'createArticle',
  args: [title, movieTitle, genre, minLength, maxContributors],
});

// 执行交易
const { write: createArticle } = useContractWrite({
  ...config,
  onSuccess: (data) => {
    console.log('文章创建成功:', data.hash);
  },
  onError: (error) => {
    console.error('创建失败:', error.message);
  },
});
```

### 事件监听
```javascript
import { useContractEvent } from 'wagmi';

// 监听文章创建事件
useContractEvent({
  address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
  abi: MOVIE_ARTICLE_ABI,
  eventName: 'ArticleCreated',
  listener: (logs) => {
    console.log('新文章创建:', logs);
  },
});
```

## 📊 错误代码

### HTTP 错误代码
- `400`: 请求参数错误
- `404`: 资源不存在
- `500`: 服务器内部错误

### 智能合约错误
- `"Article does not exist"`: 文章不存在
- `"Article is completed"`: 文章已完成
- `"You have already contributed to this article"`: 已经贡献过此文章
- `"Content too short"`: 内容长度不足
- `"Max contributors reached"`: 贡献者已达上限
- `"Cannot like your own contribution"`: 不能为自己的贡献点赞
- `"You have already liked this"`: 已经点赞过
- `"Contribution already approved"`: 贡献已经被批准

## 🚀 使用建议

### 性能优化
1. 使用 React Query 缓存 API 请求
2. 批量获取数据以减少 RPC 调用
3. 使用事件监听实时更新数据
4. 合理设置轮询间隔

### 错误处理
1. 总是处理网络错误和交易失败
2. 为用户提供清晰的错误提示
3. 实现重试机制
4. 记录错误日志用于调试

### 安全建议
1. 验证所有用户输入
2. 检查合约调用权限
3. 使用安全的随机数生成
4. 定期审计合约代码

## 📝 更新日志

### v1.0.0 (当前版本)
- ✅ 基础文章创建和管理功能
- ✅ 贡献系统和点赞功能
- ✅ 代币奖励机制  
- ✅ NFT证书铸造
- ✅ 完整的 REST API
- ✅ 智能合约部署和配置

### 计划更新
- [ ] 图片上传和存储 API
- [ ] 高级搜索和筛选接口
- [ ] 用户评级和信誉系统
- [ ] 批量操作接口
- [ ] WebSocket 实时通知

---

💡 **提示**: 完整的 API 测试集合可以在 `/test` 目录中找到。