// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MovieArticle is ERC721, Ownable, ReentrancyGuard {
    uint256 private _articleIds;
    uint256 private _contributionIds;
    
    // Article structure
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
    
    // Contribution structure
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
    
    // Mappings
    mapping(uint256 => Article) public articles;
    mapping(uint256 => Contribution) public contributions;
    mapping(uint256 => uint256[]) public articleContributions; // Article ID -> Contribution IDs
    mapping(address => uint256[]) public userContributions; // User -> Contribution IDs
    mapping(uint256 => mapping(address => bool)) public hasContributed; // Article ID -> User -> Has contributed
    mapping(uint256 => mapping(address => bool)) public hasLiked; // Contribution ID -> User -> Has liked
    
    // Reward token
    IERC20 public rewardToken;
    
    // Events
    event ArticleCreated(uint256 indexed articleId, address indexed creator, string title);
    event ContributionAdded(uint256 indexed contributionId, uint256 indexed articleId, address indexed contributor);
    event ContributionApproved(uint256 indexed contributionId, uint256 reward);
    event ContributionLiked(uint256 indexed contributionId, address indexed liker);
    event ArticleCompleted(uint256 indexed articleId, uint256 totalRewards);
    event RewardsDistributed(uint256 indexed articleId, uint256 totalAmount);
    
    constructor(address _rewardToken) ERC721("MovieArticleNFT", "MANFT") Ownable(msg.sender) {
        rewardToken = IERC20(_rewardToken);
    }
    
    // Create new article
    function createArticle(
        string memory _title,
        string memory _movieTitle,
        string memory _genre,
        uint256 _minContributionLength,
        uint256 _maxContributors
    ) external returns (uint256) {
        _articleIds++;
        uint256 newArticleId = _articleIds;
        
        articles[newArticleId] = Article({
            id: newArticleId,
            title: _title,
            movieTitle: _movieTitle,
            genre: _genre,
            creator: msg.sender,
            createdAt: block.timestamp,
            totalContributions: 0,
            totalRewards: 0,
            isCompleted: false,
            minContributionLength: _minContributionLength,
            maxContributors: _maxContributors
        });
        
        emit ArticleCreated(newArticleId, msg.sender, _title);
        return newArticleId;
    }
    
    // Add contribution
    function addContribution(uint256 _articleId, string memory _content) external {
        require(_articleId <= _articleIds, "Article does not exist");
        require(!articles[_articleId].isCompleted, "Article is completed");
        require(!hasContributed[_articleId][msg.sender], "You have already contributed to this article");
        require(bytes(_content).length >= articles[_articleId].minContributionLength, "Content too short");
        require(articles[_articleId].totalContributions < articles[_articleId].maxContributors, "Max contributors reached");
        
        _contributionIds++;
        uint256 newContributionId = _contributionIds;
        
        contributions[newContributionId] = Contribution({
            id: newContributionId,
            articleId: _articleId,
            contributor: msg.sender,
            content: _content,
            timestamp: block.timestamp,
            likes: 0,
            rewards: 0,
            isApproved: false
        });
        
        articleContributions[_articleId].push(newContributionId);
        userContributions[msg.sender].push(newContributionId);
        hasContributed[_articleId][msg.sender] = true;
        articles[_articleId].totalContributions++;
        
        emit ContributionAdded(newContributionId, _articleId, msg.sender);
    }
    
    // Like contribution
    function likeContribution(uint256 _contributionId) external {
        require(_contributionId <= _contributionIds, "Contribution does not exist");
        require(!hasLiked[_contributionId][msg.sender], "You have already liked this");
        require(contributions[_contributionId].contributor != msg.sender, "Cannot like your own contribution");
        
        contributions[_contributionId].likes++;
        hasLiked[_contributionId][msg.sender] = true;
        
        emit ContributionLiked(_contributionId, msg.sender);
    }
    
    // Approve contribution and distribute rewards
    function approveContribution(uint256 _contributionId, uint256 _reward) external onlyOwner {
        require(_contributionId <= _contributionIds, "Contribution does not exist");
        require(!contributions[_contributionId].isApproved, "Contribution already approved");
        
        contributions[_contributionId].isApproved = true;
        contributions[_contributionId].rewards = _reward;
        
        uint256 articleId = contributions[_contributionId].articleId;
        articles[articleId].totalRewards += _reward;
        
        // Transfer reward tokens
        if (_reward > 0) {
            rewardToken.transfer(contributions[_contributionId].contributor, _reward);
        }
        
        emit ContributionApproved(_contributionId, _reward);
    }
    
    // Complete article and mint NFT
    function completeArticle(uint256 _articleId) external onlyOwner {
        require(_articleId <= _articleIds, "Article does not exist");
        require(!articles[_articleId].isCompleted, "Article already completed");
        require(articles[_articleId].totalContributions > 0, "Article has no contributions");
        
        articles[_articleId].isCompleted = true;
        
        // Mint NFT for article creator
        _safeMint(articles[_articleId].creator, _articleId);
        
        emit ArticleCompleted(_articleId, articles[_articleId].totalRewards);
    }
    
    // Get all contributions for an article
    function getArticleContributions(uint256 _articleId) external view returns (uint256[] memory) {
        return articleContributions[_articleId];
    }
    
    // Get all contributions by a user
    function getUserContributions(address _user) external view returns (uint256[] memory) {
        return userContributions[_user];
    }
    
    // Get total number of articles
    function getTotalArticles() external view returns (uint256) {
        return _articleIds;
    }
    
    // Get total number of contributions
    function getTotalContributions() external view returns (uint256) {
        return _contributionIds;
    }
    
    // Withdraw tokens from contract
    function withdrawTokens(uint256 _amount) external onlyOwner {
        rewardToken.transfer(owner(), _amount);
    }
} 