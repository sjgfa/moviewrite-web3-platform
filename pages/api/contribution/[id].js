import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, MOVIE_ARTICLE_ABI } from '@/lib/web3';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid contribution ID' });
  }

  try {
    // 连接到本地网络
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.MOVIE_ARTICLE,
      MOVIE_ARTICLE_ABI,
      provider
    );

    // 获取贡献信息
    const contributionData = await contract.contributions(id);
    
    // 检查贡献是否存在
    if (contributionData[0] === 0n) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    const contribution = {
      id: Number(contributionData[0]),
      articleId: Number(contributionData[1]),
      contributor: contributionData[2],
      content: contributionData[3],
      timestamp: Number(contributionData[4]),
      likes: Number(contributionData[5]),
      rewards: Number(contributionData[6]),
      isApproved: contributionData[7],
    };

    res.status(200).json(contribution);
  } catch (error) {
    console.error('Error fetching contribution:', error);
    res.status(500).json({ error: 'Failed to fetch contribution' });
  }
} 