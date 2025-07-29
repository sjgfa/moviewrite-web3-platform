// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ArticleNFT
 * @dev NFT合约，用于将个人文章铸造为NFT，支持版税分配
 */
contract ArticleNFT is ERC721, ERC721Royalty, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // 文章状态枚举
    enum ArticleStatus {
        DRAFT,      // 草稿
        PUBLISHED,  // 已发布
        ARCHIVED,   // 已归档
        REMOVED     // 已删除
    }

    // 文章元数据结构
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
        bool transferLocked;       // 是否锁定转移
    }

    // 销售信息结构
    struct SaleInfo {
        uint256 price;             // 销售价格
        bool isForSale;           // 是否在售
        uint256 deadline;         // 销售截止时间
    }

    // 状态变量
    uint256 private _tokenIdCounter;
    
    mapping(uint256 => ArticleMeta) public articles;
    mapping(address => uint256[]) public authorArticles;
    mapping(string => uint256) public ipfsHashToToken;
    mapping(uint256 => SaleInfo) public saleInfo;
    
    // 平台配置
    uint256 public platformFeePercent = 250; // 2.5% (基于10000)
    address public platformFeeRecipient;
    uint96 public defaultRoyaltyPercent = 750; // 7.5%
    
    // 铸造费用
    uint256 public mintFee = 0.01 ether;
    bool public publicMintEnabled = true;

    // 事件定义
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

    event ArticleSale(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    event RoyaltiesDistributed(
        uint256 indexed tokenId,
        uint256 salePrice,
        uint256 platformFee,
        uint256 authorRoyalty
    );

    // 修饰符
    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _;
    }

    modifier tokenExists(uint256 tokenId) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _;
    }

    modifier validArticleData(string memory title, string memory ipfsHash) {
        require(bytes(title).length > 0 && bytes(title).length <= 200, "Invalid title length");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(ipfsHashToToken[ipfsHash] == 0, "Content already minted");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address _platformFeeRecipient
    ) ERC721(name, symbol) Ownable(msg.sender) {
        require(_platformFeeRecipient != address(0), "Invalid fee recipient");
        platformFeeRecipient = _platformFeeRecipient;
        
        // 设置默认版税信息
        _setDefaultRoyalty(_platformFeeRecipient, defaultRoyaltyPercent);
    }

    /**
     * @dev 铸造文章NFT
     * @param to 接收者地址
     * @param title 文章标题
     * @param ipfsHash IPFS内容哈希
     * @param categories 文章分类
     */
    function mintArticleNFT(
        address to,
        string memory title,
        string memory ipfsHash,
        bytes32[] memory categories
    ) external payable validArticleData(title, ipfsHash) returns (uint256) {
        return _mintArticleNFT(to, title, ipfsHash, categories);
    }

    function _mintArticleNFT(
        address to,
        string memory title,
        string memory ipfsHash,
        bytes32[] memory categories
    ) internal returns (uint256) {
        require(to != address(0), "Invalid recipient");
        
        // 检查铸造费用
        if (msg.sender != owner()) {
            require(publicMintEnabled, "Public minting disabled");
            require(msg.value >= mintFee, "Insufficient mint fee");
        }

        // 递增token ID
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        // 铸造NFT
        _safeMint(to, tokenId);

        // 为作者设置版税
        _setTokenRoyalty(tokenId, to, defaultRoyaltyPercent);

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
            categories: categories,
            transferLocked: false
        });

        // 更新映射
        authorArticles[to].push(tokenId);
        ipfsHashToToken[ipfsHash] = tokenId;

        // 转发多余的费用给平台
        if (msg.value > mintFee) {
            payable(platformFeeRecipient).transfer(msg.value);
        }

        emit ArticleMinted(tokenId, to, title, ipfsHash);
        return tokenId;
    }

    /**
     * @dev 批量铸造文章NFT（仅管理员）
     */
    function mintBatch(
        address[] memory recipients,
        string[] memory titles,
        string[] memory hashes,
        bytes32[][] memory categoriesArray
    ) external onlyOwner {
        require(
            recipients.length == titles.length && 
            titles.length == hashes.length && 
            hashes.length == categoriesArray.length,
            "Length mismatch"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            _mintArticleNFT(recipients[i], titles[i], hashes[i], categoriesArray[i]);
        }
    }

    /**
     * @dev 更新文章信息（仅作者或管理员）
     */
    function updateArticle(
        uint256 tokenId,
        string memory newTitle,
        ArticleStatus newStatus
    ) external tokenExists(tokenId) {
        ArticleMeta storage article = articles[tokenId];
        require(
            msg.sender == article.author || msg.sender == owner(),
            "Not authorized"
        );

        if (bytes(newTitle).length > 0) {
            article.title = newTitle;
        }
        
        article.status = newStatus;

        emit ArticleUpdated(tokenId, newTitle, newStatus);
    }

    /**
     * @dev 更新文章统计数据（仅管理员）
     */
    function updateArticleStats(
        uint256 tokenId,
        uint256 newViews,
        uint256 newLikes
    ) external onlyOwner tokenExists(tokenId) {
        articles[tokenId].views = newViews;
        articles[tokenId].likes = newLikes;

        emit StatsUpdated(tokenId, newViews, newLikes);
    }

    /**
     * @dev 设置文章转移锁定状态
     */
    function setTransferLock(uint256 tokenId, bool locked) 
        external 
        onlyTokenOwner(tokenId) 
        tokenExists(tokenId) 
    {
        articles[tokenId].transferLocked = locked;
    }

    /**
     * @dev 出售文章NFT
     */
    function listForSale(
        uint256 tokenId,
        uint256 price,
        uint256 deadline
    ) external onlyTokenOwner(tokenId) tokenExists(tokenId) {
        require(price > 0, "Price must be greater than 0");
        require(deadline > block.timestamp, "Invalid deadline");
        require(!articles[tokenId].transferLocked, "Transfer locked");

        saleInfo[tokenId] = SaleInfo({
            price: price,
            isForSale: true,
            deadline: deadline
        });
    }

    /**
     * @dev 取消出售
     */
    function cancelSale(uint256 tokenId) 
        external 
        onlyTokenOwner(tokenId) 
        tokenExists(tokenId) 
    {
        delete saleInfo[tokenId];
    }

    /**
     * @dev 购买文章NFT
     */
    function buyArticle(uint256 tokenId) 
        external 
        payable 
        nonReentrant 
        tokenExists(tokenId) 
    {
        SaleInfo memory sale = saleInfo[tokenId];
        require(sale.isForSale, "Not for sale");
        require(block.timestamp <= sale.deadline, "Sale expired");
        require(msg.value >= sale.price, "Insufficient payment");

        address seller = ownerOf(tokenId);
        require(msg.sender != seller, "Cannot buy own token");

        // 清除销售信息
        delete saleInfo[tokenId];

        // 分配收益
        _distributeSaleProceeds(tokenId, sale.price, seller);

        // 转移NFT
        _transfer(seller, msg.sender, tokenId);

        // 退还多余的付款
        if (msg.value > sale.price) {
            payable(msg.sender).transfer(msg.value - sale.price);
        }

        emit ArticleSale(tokenId, seller, msg.sender, sale.price);
    }

    /**
     * @dev 分配销售收益
     */
    function _distributeSaleProceeds(
        uint256 tokenId,
        uint256 salePrice,
        address seller
    ) private {
        ArticleMeta memory article = articles[tokenId];
        
        // 计算各项费用
        uint256 platformFee = (salePrice * platformFeePercent) / 10000;
        uint256 authorRoyalty = 0;
        
        // 如果卖家不是原作者，则需要支付版税
        if (seller != article.author) {
            authorRoyalty = (salePrice * defaultRoyaltyPercent) / 10000;
        }
        
        uint256 sellerAmount = salePrice - platformFee - authorRoyalty;

        // 分配资金
        if (platformFee > 0) {
            payable(platformFeeRecipient).transfer(platformFee);
        }
        
        if (authorRoyalty > 0) {
            payable(article.author).transfer(authorRoyalty);
        }
        
        if (sellerAmount > 0) {
            payable(seller).transfer(sellerAmount);
        }

        emit RoyaltiesDistributed(tokenId, salePrice, platformFee, authorRoyalty);
    }

    /**
     * @dev 获取作者的所有文章
     */
    function getAuthorArticles(address author) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return authorArticles[author];
    }

    /**
     * @dev 获取文章完整信息
     */
    function getArticleInfo(uint256 tokenId) 
        external 
        view 
        tokenExists(tokenId)
        returns (ArticleMeta memory) 
    {
        return articles[tokenId];
    }

    /**
     * @dev 验证内容完整性
     */
    function verifyContent(uint256 tokenId, string memory ipfsHash) 
        external 
        view 
        tokenExists(tokenId)
        returns (bool) 
    {
        return keccak256(bytes(articles[tokenId].ipfsHash)) == keccak256(bytes(ipfsHash));
    }

    /**
     * @dev 获取总供应量
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev 重写更新函数以支持转移锁定
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // 跳过铸造时的检查
        if (from != address(0)) {
            require(!articles[tokenId].transferLocked, "Transfer locked");
        }
        
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev 设置平台费用比例（仅管理员）
     */
    function setPlatformFeePercent(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee too high"); // 最高10%
        platformFeePercent = _feePercent;
    }

    /**
     * @dev 设置铸造费用（仅管理员）
     */
    function setMintFee(uint256 _mintFee) external onlyOwner {
        mintFee = _mintFee;
    }

    /**
     * @dev 设置公开铸造状态（仅管理员）
     */
    function setPublicMintEnabled(bool _enabled) external onlyOwner {
        publicMintEnabled = _enabled;
    }

    /**
     * @dev 提取合约余额（仅管理员）
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev 紧急暂停转移功能
     */
    function emergencyLockTransfers(uint256[] memory tokenIds) external onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (_ownerOf(tokenIds[i]) != address(0)) {
                articles[tokenIds[i]].transferLocked = true;
            }
        }
    }

    /**
     * @dev 获取token URI
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        tokenExists(tokenId)
        returns (string memory)
    {
        ArticleMeta memory article = articles[tokenId];
        
        // 构建JSON元数据
        string memory json = string(abi.encodePacked(
            '{"name":"', article.title, '",',
            '"description":"MovieWrite Article NFT",',
            '"image":"https://gateway.pinata.cloud/ipfs/', article.ipfsHash, '",',
            '"external_url":"https://moviewrite.xyz/individual/', tokenId.toString(), '",',
            '"attributes":[',
                '{"trait_type":"Author","value":"', Strings.toHexString(uint160(article.author), 20), '"},',
                '{"trait_type":"Published","value":"', article.publishedAt.toString(), '"},',
                '{"trait_type":"Views","value":"', article.views.toString(), '"},',
                '{"trait_type":"Likes","value":"', article.likes.toString(), '"}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _encode(bytes(json))
        ));
    }

    /**
     * @dev Base64编码
     */
    function _encode(bytes memory data) private pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        string memory result = new string(encodedLen + 32);
        
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            
            for {
                let i := 0
            } lt(i, mload(data)) {
                i := add(i, 3)
            } {
                let input := and(mload(add(data, i)), 0xffffff)
                
                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(input, 0x3F))), 0xFF))
                out := shl(224, out)
                
                mstore(resultPtr, out)
                
                resultPtr := add(resultPtr, 4)
            }
            
            switch mod(mload(data), 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }
            
            mstore(result, encodedLen)
        }
        
        return result;
    }

    /**
     * @dev 重写supportsInterface以支持版税
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}