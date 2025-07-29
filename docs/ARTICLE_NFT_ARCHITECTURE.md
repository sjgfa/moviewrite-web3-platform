# 🎨 ArticleNFT 合约架构设计

## 📋 设计概览

**合约名称**: ArticleNFT  
**标准**: ERC721 + 自定义扩展  
**目标**: 为个人文章提供NFT化功能，支持版税分配和内容所有权  

## 🎯 核心功能需求

### 1. 基础NFT功能
- [x] ERC721标准实现
- [x] 文章元数据存储
- [x] IPFS集成
- [x] 转移限制（可选）

### 2. 版税系统
- [x] EIP-2981版税标准
- [x] 多级版税分配
- [x] 平台费用机制
- [x] 创作者收益保护

### 3. 文章管理
- [x] 文章状态跟踪
- [x] 内容验证
- [x] 批量操作支持
- [x] 权限管理

## 🏗️ 合约架构

### 主合约：ArticleNFT
```solidity
contract ArticleNFT is ERC721, ERC721Royalty, Ownable, ReentrancyGuard {
    // 核心数据结构
    struct ArticleMeta {
        uint256 tokenId;           // NFT token ID
        string title;              // 文章标题
        string ipfsHash;           // IPFS内容哈希
        address author;            // 原创作者
        uint256 publishedAt;       // 发布时间
        uint256 views;             // 浏览量
        uint256 likes;             // 点赞数
        ArticleStatus status;      // 文章状态
        bytes32[] categories;      // 文章分类
    }
    
    enum ArticleStatus {
        DRAFT,
        PUBLISHED,
        ARCHIVED,
        REMOVED
    }
    
    // 状态变量
    mapping(uint256 => ArticleMeta) public articles;
    mapping(address => uint256[]) public authorArticles;
    mapping(string => uint256) public ipfsHashToToken;
    
    uint256 private _tokenIdCounter;
    uint256 public platformFeePercent = 250; // 2.5%
    address public platformFeeRecipient;
}
```

### 扩展合约：ArticleMarketplace
```solidity
contract ArticleMarketplace is ReentrancyGuard, Ownable {
    // 销售和拍卖功能
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        uint256 deadline;
        bool isActive;
    }
    
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => uint256) public bidCount;
}
```

## 🔧 核心功能实现

### 1. NFT铸造流程
```solidity
function mintArticleNFT(
    address to,
    string memory title,
    string memory ipfsHash,
    bytes32[] memory categories,
    uint96 royaltyFeeNumerator
) external returns (uint256) {
    // 验证输入参数
    require(bytes(title).length > 0, "Title cannot be empty");
    require(bytes(ipfsHash).length > 0, "IPFS hash required");
    require(ipfsHashToToken[ipfsHash] == 0, "Content already minted");
    
    // 递增token ID
    uint256 tokenId = ++_tokenIdCounter;
    
    // 铸造NFT
    _safeMint(to, tokenId);
    
    // 设置版税
    _setTokenRoyalty(tokenId, to, royaltyFeeNumerator);
    
    // 存储文章元数据
    articles[tokenId] = ArticleMeta({
        tokenId: tokenId,
        title: title,
        ipfsHash: ipfsHash,
        author: to,
        publishedAt: block.timestamp,
        views: 0,
        likes: 0,
        status: ArticleStatus.PUBLISHED,
        categories: categories
    });
    
    // 更新映射
    authorArticles[to].push(tokenId);
    ipfsHashToToken[ipfsHash] = tokenId;
    
    emit ArticleMinted(tokenId, to, title, ipfsHash);
    return tokenId;
}
```

### 2. 版税分配系统
```solidity
// EIP-2981版税实现
function royaltyInfo(uint256 tokenId, uint256 salePrice)
    public
    view
    override
    returns (address, uint256)
{
    RoyaltyInfo memory royalty = _tokenRoyaltyInfo[tokenId];
    
    if (royalty.receiver == address(0)) {
        royalty = _defaultRoyaltyInfo;
    }
    
    uint256 royaltyAmount = (salePrice * royalty.royaltyFraction) / _feeDenominator();
    
    return (royalty.receiver, royaltyAmount);
}

// 多级版税分配
function distributeRoyalties(uint256 tokenId, uint256 salePrice) 
    external 
    nonReentrant 
{
    ArticleMeta memory article = articles[tokenId];
    
    // 计算各项费用
    uint256 platformFee = (salePrice * platformFeePercent) / 10000;
    uint256 authorRoyalty = (salePrice * 750) / 10000; // 7.5%
    uint256 sellerAmount = salePrice - platformFee - authorRoyalty;
    
    // 分配资金
    payable(platformFeeRecipient).transfer(platformFee);
    payable(article.author).transfer(authorRoyalty);
    payable(ownerOf(tokenId)).transfer(sellerAmount);
    
    emit RoyaltiesDistributed(tokenId, salePrice, platformFee, authorRoyalty);
}
```

### 3. 文章数据管理
```solidity
// 更新文章统计
function updateArticleStats(uint256 tokenId, uint256 newViews, uint256 newLikes) 
    external 
    onlyOwner 
{
    require(_exists(tokenId), "Article does not exist");
    
    articles[tokenId].views = newViews;
    articles[tokenId].likes = newLikes;
    
    emit StatsUpdated(tokenId, newViews, newLikes);
}

// 批量获取作者文章
function getAuthorArticles(address author) 
    external 
    view 
    returns (uint256[] memory) 
{
    return authorArticles[author];
}

// 文章内容验证
function verifyContent(uint256 tokenId, string memory ipfsHash) 
    external 
    view 
    returns (bool) 
{
    return keccak256(bytes(articles[tokenId].ipfsHash)) == keccak256(bytes(ipfsHash));
}
```

## 📊 数据结构设计

### 存储优化
```solidity
// 紧凑的数据结构，减少存储槽
struct CompactArticleMeta {
    address author;           // 20 bytes
    uint32 publishedAt;       // 4 bytes (enough until 2106)
    uint32 views;            // 4 bytes
    uint16 likes;            // 2 bytes
    uint8 status;            // 1 byte
    uint8 categoryCount;     // 1 byte
    // Total: 32 bytes (1 slot)
    
    string title;            // separate slot
    string ipfsHash;         // separate slot
    bytes32[] categories;    // separate slots
}
```

### 事件定义
```solidity
event ArticleMinted(
    uint256 indexed tokenId,
    address indexed author,
    string title,
    string ipfsHash
);

event ArticleUpdated(
    uint256 indexed tokenId,
    string newTitle,
    ArticleStatus newStatus
);

event StatsUpdated(
    uint256 indexed tokenId,
    uint256 views,
    uint256 likes
);

event RoyaltiesDistributed(
    uint256 indexed tokenId,
    uint256 salePrice,
    uint256 platformFee,
    uint256 authorRoyalty
);
```

## 🔒 安全考虑

### 1. 访问控制
- 使用OpenZeppelin的AccessControl
- 分离铸造权限和管理权限
- 多重签名支持

### 2. 重入攻击防护
- 使用ReentrancyGuard
- 先修改状态再转账
- 检查-效果-交互模式

### 3. 整数溢出保护
- 使用Solidity 0.8+内置保护
- 显式检查关键计算

### 4. 前端验证
```solidity
modifier validArticleData(string memory title, string memory ipfsHash) {
    require(bytes(title).length > 0 && bytes(title).length <= 200, "Invalid title");
    require(bytes(ipfsHash).length == 46, "Invalid IPFS hash format");
    require(!ipfsHashExists(ipfsHash), "Content already exists");
    _;
}
```

## 🚀 Gas优化策略

### 1. 批量操作
```solidity
function mintBatch(
    address[] memory recipients,
    string[] memory titles,
    string[] memory hashes
) external onlyOwner {
    require(recipients.length == titles.length, "Length mismatch");
    
    for (uint256 i = 0; i < recipients.length; i++) {
        _mintArticleNFT(recipients[i], titles[i], hashes[i]);
    }
}
```

### 2. 存储优化
- 使用packed structs
- 延迟存储昂贵数据
- 利用事件存储历史数据

### 3. 计算优化
- 预计算常用值
- 使用位运算
- 避免循环中的复杂计算

## 📈 升级策略

### 1. 代理模式
```solidity
// 使用OpenZeppelin的透明代理
contract ArticleNFTProxy is TransparentUpgradeableProxy {
    constructor(
        address implementation,
        address admin,
        bytes memory data
    ) TransparentUpgradeableProxy(implementation, admin, data) {}
}
```

### 2. 版本管理
- 语义化版本控制
- 向后兼容性检查
- 迁移脚本准备

## 🧪 测试策略

### 1. 单元测试
- 所有public函数覆盖
- 边界条件测试
- 错误情况处理

### 2. 集成测试
- 与前端交互测试
- IPFS集成测试
- 版税分配测试

### 3. 压力测试
- 大量数据处理
- Gas费用测试
- 并发操作测试