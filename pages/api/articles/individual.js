// API端点：个人文章发布和管理
import ipfsService from '../../../lib/ipfs';
import db from '../../../lib/db-mock';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return handleCreateArticle(req, res);
    case 'GET':
      return handleGetArticles(req, res);
    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// 创建新的个人文章
async function handleCreateArticle(req, res) {
  try {
    const { 
      title, 
      content, 
      authorAddress, 
      categories = [],
      isDraft = false,
      metadata = {}
    } = req.body;

    // 验证必填字段
    if (!title || !content || !authorAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'content', 'authorAddress']
      });
    }

    // 准备要上传到IPFS的数据
    const ipfsData = {
      title,
      content,
      author: authorAddress,
      categories,
      metadata: {
        ...metadata,
        platform: 'MovieWrite',
        version: '2.0',
        contentType: 'individual'
      },
      timestamp: new Date().toISOString()
    };

    let ipfsHash = null;
    let ipfsUrl = null;

    // 如果不是草稿且IPFS服务已配置，上传到IPFS
    if (!isDraft && ipfsService.isConfigured()) {
      try {
        const ipfsResult = await ipfsService.uploadJSON(ipfsData, {
          name: `MovieWrite Article: ${title}`,
          keyvalues: {
            author: authorAddress,
            type: 'article'
          }
        });
        
        ipfsHash = ipfsResult.ipfsHash;
        ipfsUrl = ipfsResult.url;
      } catch (ipfsError) {
        console.error('IPFS upload failed:', ipfsError);
        // 继续处理，但不存储IPFS哈希
      }
    }

    // 保存到数据库
    const article = await db.createIndividualArticle({
      title,
      content,
      authorAddress,
      categories,
      ipfsHash,
      ipfsUrl,
      isDraft,
      metadata
    });

    res.status(201).json({
      success: true,
      article,
      ipfs: ipfsHash ? {
        hash: ipfsHash,
        url: ipfsUrl
      } : null
    });

  } catch (error) {
    console.error('Article creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create article',
      message: error.message 
    });
  }
}

// 获取文章列表
async function handleGetArticles(req, res) {
  try {
    const { 
      author,
      limit = 10,
      offset = 0,
      includeDrafts = false
    } = req.query;

    let articles;

    if (author) {
      // 获取特定作者的文章
      articles = await db.getUserArticles(author, includeDrafts === 'true');
    } else {
      // 获取最近的文章
      articles = await db.getRecentArticles(
        parseInt(limit),
        parseInt(offset)
      );
    }

    res.status(200).json({
      success: true,
      articles,
      count: articles.length,
      hasMore: articles.length === parseInt(limit)
    });

  } catch (error) {
    console.error('Article fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch articles',
      message: error.message 
    });
  }
}

// 配置API路由
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};