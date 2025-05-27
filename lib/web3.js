import { getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { hardhat, localhost } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { injectedWallet, metaMaskWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';

// 使用require导入JSON文件
const contractAddresses = require('../contract-addresses.json');
const MovieArticleArtifact = require('../artifacts/contracts/MovieArticle.sol/MovieArticle.json');
const RewardTokenArtifact = require('../artifacts/contracts/RewardToken.sol/RewardToken.json');

// Configure chains with custom localhost
const localhostChain = {
  id: 31337,
  name: 'Hardhat Local',
  network: 'hardhat',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['http://127.0.0.1:8545'] },
    default: { http: ['http://127.0.0.1:8545'] },
  },
  blockExplorers: {
    default: { name: 'Hardhat', url: 'http://127.0.0.1:8545' },
  },
  testnet: true,
};

const { chains, publicClient } = configureChains(
  [localhostChain],
  [publicProvider()]
);

// 简化的钱包配置，避免WalletConnect错误
const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ 
        chains,
        projectId: 'local-development' // 本地开发使用简单ID
      }),
    ],
  },
]);

// Create wagmi config
export const wagmiConfig = createConfig({
  autoConnect: false, // 改为false避免hydration问题
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