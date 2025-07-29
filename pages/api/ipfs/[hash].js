// API端点：从IPFS获取内容
import ipfsService from '../../../lib/ipfs';

export default async function handler(req, res) {
  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { hash } = req.query;

    // 验证输入
    if (!hash) {
      return res.status(400).json({ error: 'No IPFS hash provided' });
    }

    // 从IPFS获取内容
    const data = await ipfsService.fetchFromIPFS(hash);

    // 设置缓存头
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    
    // 返回内容
    res.status(200).json({
      success: true,
      data,
      ipfsHash: hash,
      url: ipfsService.getIPFSUrl(hash)
    });

  } catch (error) {
    console.error('IPFS fetch error:', error);
    
    // 如果是404错误，返回更友好的消息
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ 
        error: 'Content not found on IPFS',
        ipfsHash: req.query.hash
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch from IPFS',
      message: error.message 
    });
  }
}