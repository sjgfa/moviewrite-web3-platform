// API端点：上传内容到IPFS
import ipfsService from '../../../lib/ipfs';

export default async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 检查IPFS服务是否已配置
    if (!ipfsService.isConfigured()) {
      return res.status(503).json({ 
        error: 'IPFS service not configured',
        message: 'Please add Pinata API keys to your environment variables'
      });
    }

    const { data, metadata } = req.body;

    // 验证输入
    if (!data) {
      return res.status(400).json({ error: 'No data provided' });
    }

    // 上传到IPFS
    const result = await ipfsService.uploadJSON(data, metadata);

    // 返回结果
    res.status(200).json({
      success: true,
      ipfsHash: result.ipfsHash,
      url: result.url,
      size: result.pinSize,
      timestamp: result.timestamp
    });

  } catch (error) {
    console.error('IPFS upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload to IPFS',
      message: error.message 
    });
  }
}

// 配置API路由以支持较大的请求体
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};