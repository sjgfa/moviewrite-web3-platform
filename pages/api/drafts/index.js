// API端点：文章草稿管理
import db from '../../../lib/db-mock';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return handleSaveDraft(req, res);
    case 'GET':
      return handleGetDrafts(req, res);
    case 'DELETE':
      return handleDeleteDraft(req, res);
    default:
      res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// 保存草稿
async function handleSaveDraft(req, res) {
  try {
    const { 
      authorAddress,
      title,
      content,
      metadata = {}
    } = req.body;

    // 验证必填字段
    if (!authorAddress) {
      return res.status(400).json({ 
        error: 'Author address is required' 
      });
    }

    // 保存草稿
    const draft = await db.saveDraft(authorAddress, {
      title: title || 'Untitled Draft',
      content: content || '',
      metadata
    });

    res.status(201).json({
      success: true,
      draft
    });

  } catch (error) {
    console.error('Draft save error:', error);
    res.status(500).json({ 
      error: 'Failed to save draft',
      message: error.message 
    });
  }
}

// 获取用户的草稿列表
async function handleGetDrafts(req, res) {
  try {
    const { authorAddress } = req.query;

    if (!authorAddress) {
      return res.status(400).json({ 
        error: 'Author address is required' 
      });
    }

    const drafts = await db.getUserDrafts(authorAddress);

    res.status(200).json({
      success: true,
      drafts,
      count: drafts.length
    });

  } catch (error) {
    console.error('Drafts fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch drafts',
      message: error.message 
    });
  }
}

// 删除草稿
async function handleDeleteDraft(req, res) {
  try {
    const { id, authorAddress } = req.body;

    if (!id || !authorAddress) {
      return res.status(400).json({ 
        error: 'Draft ID and author address are required' 
      });
    }

    // 这里应该验证草稿的所有权，但在mock中简化处理
    await db.deleteDraft(id);

    res.status(200).json({
      success: true,
      message: 'Draft deleted successfully'
    });

  } catch (error) {
    console.error('Draft delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete draft',
      message: error.message 
    });
  }
}