// API端点：单个个人文章的获取、更新和删除
import db from '../../../../lib/db-mock';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  switch (method) {
    case 'GET':
      return handleGetArticle(req, res, id);
    case 'PUT':
      return handleUpdateArticle(req, res, id);
    case 'DELETE':
      return handleDeleteArticle(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// 获取单个文章
async function handleGetArticle(req, res, id) {
  try {
    const article = await db.getIndividualArticle(id);
    
    if (!article) {
      return res.status(404).json({ 
        error: 'Article not found' 
      });
    }

    // 增加浏览量
    await db.incrementArticleViews(id);

    res.status(200).json({
      success: true,
      article
    });

  } catch (error) {
    console.error('Article fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch article',
      message: error.message 
    });
  }
}

// 更新文章
async function handleUpdateArticle(req, res, id) {
  try {
    const { 
      title, 
      content, 
      categories,
      isDraft,
      authorAddress 
    } = req.body;

    // 获取现有文章以验证所有权
    const existingArticle = await db.getIndividualArticle(id);
    
    if (!existingArticle) {
      return res.status(404).json({ 
        error: 'Article not found' 
      });
    }

    // 验证作者身份
    if (existingArticle.authorAddress !== authorAddress) {
      return res.status(403).json({ 
        error: 'Unauthorized',
        message: 'You are not the author of this article'
      });
    }

    // 准备更新数据
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (categories !== undefined) updates.categories = categories;
    if (isDraft !== undefined) {
      updates.isDraft = isDraft;
      // 如果从草稿变为发布，设置发布时间
      if (!isDraft && existingArticle.isDraft) {
        updates.publishedAt = new Date().toISOString();
      }
    }

    // 更新文章
    const updatedArticle = await db.updateArticle(id, updates);

    res.status(200).json({
      success: true,
      article: updatedArticle
    });

  } catch (error) {
    console.error('Article update error:', error);
    res.status(500).json({ 
      error: 'Failed to update article',
      message: error.message 
    });
  }
}

// 删除文章（软删除）
async function handleDeleteArticle(req, res, id) {
  try {
    const { authorAddress } = req.body;

    // 获取现有文章以验证所有权
    const existingArticle = await db.getIndividualArticle(id);
    
    if (!existingArticle) {
      return res.status(404).json({ 
        error: 'Article not found' 
      });
    }

    // 验证作者身份
    if (existingArticle.authorAddress !== authorAddress) {
      return res.status(403).json({ 
        error: 'Unauthorized',
        message: 'You are not the author of this article'
      });
    }

    // 软删除：标记为已删除而不是真正删除
    await db.updateArticle(id, { 
      isDeleted: true,
      deletedAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('Article delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete article',
      message: error.message 
    });
  }
}