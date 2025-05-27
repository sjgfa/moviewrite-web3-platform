import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { hardhat, localhost } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

// 使用require导入JSON文件
const contractAddresses = require('../contract-addresses.json');
const MovieArticleArtifact = require('../artifacts/contracts/MovieArticle.sol/MovieArticle.json');
const RewardTokenArtifact = require('../artifacts/contracts/RewardToken.sol/RewardToken.json');

// Configure chains
const { chains, publicClient } = configureChains(
  [hardhat, localhost],
  [publicProvider()]
);

// Configure wallets
const { connectors } = getDefaultWallets({
  appName: 'Movie Article Web3',
  projectId: '2f5a2b1c8d3e4f5a6b7c8d9e0f1a2b3c', // 使用一个示例项目ID，生产环境需要真实的
  chains
});

// Create wagmi config
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

export { chains };

// Contract addresses (从配置文件读取)
export const CONTRACT_ADDRESSES = {
  MOVIE_ARTICLE: contractAddresses.movieArticle || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  REWARD_TOKEN: contractAddresses.rewardToken || '0x5FbDB2315678afecb367f032d93F642f64180aa3'
};

// 使用编译后的真实ABI
export const MOVIE_ARTICLE_ABI = MovieArticleArtifact.abi;
export const REWARD_TOKEN_ABI = RewardTokenArtifact.abi;

// 工具函数
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  return new Date(Number(timestamp) * 1000).toLocaleDateString('zh-CN');
};

export const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  return new Date(Number(timestamp) * 1000).toLocaleString('zh-CN');
}; 