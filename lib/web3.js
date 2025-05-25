import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { hardhat, localhost } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

// Configure chains
const { chains, publicClient } = configureChains(
  [hardhat, localhost],
  [publicProvider()]
);

// Configure wallets
const { connectors } = getDefaultWallets({
  appName: 'Movie Article Web3',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains
});

// Create wagmi config
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

export { chains };

// Contract addresses (updated with deployed addresses)
export const CONTRACT_ADDRESSES = {
  MOVIE_ARTICLE: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  REWARD_TOKEN: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
};

// Simplified ABI for basic functionality
export const MOVIE_ARTICLE_ABI = [
  "function createArticle(string memory _title, string memory _movieTitle, string memory _genre, uint256 _minContributionLength, uint256 _maxContributors) external returns (uint256)",
  "function addContribution(uint256 _articleId, string memory _content) external",
  "function likeContribution(uint256 _contributionId) external",
  "function approveContribution(uint256 _contributionId, uint256 _reward) external",
  "function completeArticle(uint256 _articleId) external",
  "function articles(uint256) external view returns (uint256 id, string memory title, string memory movieTitle, string memory genre, address creator, uint256 createdAt, uint256 totalContributions, uint256 totalRewards, bool isCompleted, uint256 minContributionLength, uint256 maxContributors)",
  "function contributions(uint256) external view returns (uint256 id, uint256 articleId, address contributor, string memory content, uint256 timestamp, uint256 likes, uint256 rewards, bool isApproved)",
  "function getTotalArticles() external view returns (uint256)",
  "function getTotalContributions() external view returns (uint256)",
  "function getArticleContributions(uint256 _articleId) external view returns (uint256[] memory)",
  "function getUserContributions(address _user) external view returns (uint256[] memory)",
  "function hasContributed(uint256, address) external view returns (bool)",
  "function hasLiked(uint256, address) external view returns (bool)",
  "event ArticleCreated(uint256 indexed articleId, address indexed creator, string title)",
  "event ContributionAdded(uint256 indexed contributionId, uint256 indexed articleId, address indexed contributor)",
  "event ContributionLiked(uint256 indexed contributionId, address indexed liker)",
  "event ContributionApproved(uint256 indexed contributionId, uint256 reward)",
  "event ArticleCompleted(uint256 indexed articleId, uint256 totalRewards)"
];

export const REWARD_TOKEN_ABI = [
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function mint(address to, uint256 amount) external",
  "function burn(uint256 amount) external",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
]; 