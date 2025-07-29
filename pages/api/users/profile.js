// API端点：用户profile管理
import db from '../../../lib/db-mock';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetProfile(req, res);
    case 'POST':
    case 'PUT':
      return handleUpdateProfile(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// 获取用户profile
async function handleGetProfile(req, res) {
  try {
    const { address, username } = req.query;

    if (!address && !username) {
      return res.status(400).json({ 
        error: 'Address or username required' 
      });
    }

    let profile;
    
    if (username) {
      profile = await db.getUserByUsername(username);
    } else {
      profile = await db.getUserProfile(address);
    }

    if (!profile) {
      return res.status(404).json({ 
        error: 'Profile not found' 
      });
    }

    // 获取一些统计信息
    const articles = await db.getUserArticles(profile.address, false);
    const followers = await db.getFollowers(profile.address);
    const following = await db.getFollowing(profile.address);

    res.status(200).json({
      success: true,
      profile: {
        ...profile,
        stats: {
          articlesCount: articles.length,
          followersCount: followers.length,
          followingCount: following.length
        }
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      message: error.message 
    });
  }
}

// 创建或更新用户profile
async function handleUpdateProfile(req, res) {
  try {
    const { 
      address,
      username,
      displayName,
      bio,
      avatarUrl,
      twitterHandle,
      websiteUrl
    } = req.body;

    // 验证必填字段
    if (!address) {
      return res.status(400).json({ 
        error: 'Address is required' 
      });
    }

    // 验证用户名唯一性
    if (username) {
      const existingUser = await db.getUserByUsername(username);
      if (existingUser && existingUser.address !== address) {
        return res.status(409).json({ 
          error: 'Username already taken' 
        });
      }
    }

    // 准备profile数据
    const profileData = {
      username,
      displayName,
      bio,
      avatarUrl,
      twitterHandle,
      websiteUrl
    };

    // 移除undefined值
    Object.keys(profileData).forEach(key => {
      if (profileData[key] === undefined) {
        delete profileData[key];
      }
    });

    // 创建或更新profile
    const profile = await db.createOrUpdateUserProfile(address, profileData);

    res.status(200).json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      message: error.message 
    });
  }
}