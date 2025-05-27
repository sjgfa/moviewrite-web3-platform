import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, MOVIE_ARTICLE_ABI } from '@/lib/web3';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid article ID' });
  }

  try {
    // 连接到本地网络
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.MOVIE_ARTICLE,
      MOVIE_ARTICLE_ABI,
      provider
    );

    // 获取文章信息
    const articleData = await contract.articles(id);
    
    // 检查文章是否存在
    if (articleData[0] === 0n) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const article = {
      id: Number(articleData[0]),
      title: articleData[1],
      movieTitle: articleData[2],
      genre: articleData[3],
      creator: articleData[4],
      createdAt: Number(articleData[5]),
      totalContributions: Number(articleData[6]),
      totalRewards: Number(articleData[7]),
      isCompleted: articleData[8],
      minContributionLength: Number(articleData[9]),
      maxContributors: Number(articleData[10]),
    };

    res.status(200).json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
} 