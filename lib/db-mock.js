// Mock数据库系统 - 用于MVP快速开发
// 后续可以替换为真实的PostgreSQL

const fs = require('fs');
const path = require('path');

class MockDatabase {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.dataFile = path.join(this.dataDir, 'db.json');
    this.ensureDataDir();
    this.data = this.loadData();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  loadData() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const rawData = fs.readFileSync(this.dataFile, 'utf8');
        return JSON.parse(rawData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    
    // 初始数据结构
    return {
      userProfiles: {},
      individualArticles: [],
      publications: [],
      categories: [
        { id: 1, name: 'Technology', slug: 'technology', color: '#3B82F6' },
        { id: 2, name: 'Blockchain', slug: 'blockchain', color: '#8B5CF6' },
        { id: 3, name: 'Movies', slug: 'movies', color: '#EF4444' },
        { id: 4, name: 'Entertainment', slug: 'entertainment', color: '#F59E0B' },
        { id: 5, name: 'Tutorial', slug: 'tutorial', color: '#10B981' },
        { id: 6, name: 'Opinion', slug: 'opinion', color: '#6366F1' }
      ],
      follows: [],
      likes: [],
      drafts: []
    };
  }

  saveData() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // 用户相关方法
  async createOrUpdateUserProfile(address, profileData) {
    this.data.userProfiles[address] = {
      ...this.data.userProfiles[address],
      ...profileData,
      address,
      updatedAt: new Date().toISOString()
    };
    
    if (!this.data.userProfiles[address].createdAt) {
      this.data.userProfiles[address].createdAt = new Date().toISOString();
    }
    
    this.saveData();
    return this.data.userProfiles[address];
  }

  async getUserProfile(address) {
    return this.data.userProfiles[address] || null;
  }

  async getUserByUsername(username) {
    return Object.values(this.data.userProfiles).find(
      profile => profile.username === username
    ) || null;
  }

  // 文章相关方法
  async createIndividualArticle(articleData) {
    const article = {
      id: Date.now(), // 简单的ID生成
      ...articleData,
      contentType: 'individual',
      isIndividual: true,
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      publishedAt: articleData.isDraft ? null : new Date().toISOString()
    };
    
    this.data.individualArticles.push(article);
    this.saveData();
    return article;
  }

  async getIndividualArticle(id) {
    return this.data.individualArticles.find(article => article.id === parseInt(id)) || null;
  }

  async getArticleByIpfsHash(ipfsHash) {
    return this.data.individualArticles.find(article => article.ipfsHash === ipfsHash) || null;
  }

  async getUserArticles(authorAddress, includeD rafts = false) {
    return this.data.individualArticles.filter(article => 
      article.authorAddress === authorAddress &&
      (includeDrafts || !article.isDraft)
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getRecentArticles(limit = 10, offset = 0) {
    return this.data.individualArticles
      .filter(article => !article.isDraft && article.publishedAt)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(offset, offset + limit);
  }

  async updateArticle(id, updates) {
    const index = this.data.individualArticles.findIndex(
      article => article.id === parseInt(id)
    );
    
    if (index !== -1) {
      this.data.individualArticles[index] = {
        ...this.data.individualArticles[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveData();
      return this.data.individualArticles[index];
    }
    
    return null;
  }

  async incrementArticleViews(id) {
    const article = await this.getIndividualArticle(id);
    if (article) {
      return await this.updateArticle(id, { views: (article.views || 0) + 1 });
    }
    return null;
  }

  // 草稿相关方法
  async saveDraft(authorAddress, draftData) {
    const draft = {
      id: Date.now(),
      authorAddress,
      ...draftData,
      lastSavedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    // 保留最近10个草稿
    this.data.drafts = this.data.drafts
      .filter(d => d.authorAddress === authorAddress)
      .slice(0, 9);
    
    this.data.drafts.unshift(draft);
    this.saveData();
    return draft;
  }

  async getUserDrafts(authorAddress) {
    return this.data.drafts
      .filter(draft => draft.authorAddress === authorAddress)
      .sort((a, b) => new Date(b.lastSavedAt) - new Date(a.lastSavedAt));
  }

  async deleteDraft(id) {
    this.data.drafts = this.data.drafts.filter(
      draft => draft.id !== parseInt(id)
    );
    this.saveData();
  }

  // 社交功能
  async followUser(followerAddress, followingAddress) {
    if (followerAddress === followingAddress) {
      throw new Error('Cannot follow yourself');
    }
    
    const existing = this.data.follows.find(
      f => f.followerAddress === followerAddress && 
           f.followingAddress === followingAddress
    );
    
    if (!existing) {
      this.data.follows.push({
        followerAddress,
        followingAddress,
        createdAt: new Date().toISOString()
      });
      this.saveData();
    }
  }

  async unfollowUser(followerAddress, followingAddress) {
    this.data.follows = this.data.follows.filter(
      f => !(f.followerAddress === followerAddress && 
             f.followingAddress === followingAddress)
    );
    this.saveData();
  }

  async getFollowers(userAddress) {
    return this.data.follows
      .filter(f => f.followingAddress === userAddress)
      .map(f => f.followerAddress);
  }

  async getFollowing(userAddress) {
    return this.data.follows
      .filter(f => f.followerAddress === userAddress)
      .map(f => f.followingAddress);
  }

  async isFollowing(followerAddress, followingAddress) {
    return this.data.follows.some(
      f => f.followerAddress === followerAddress && 
           f.followingAddress === followingAddress
    );
  }

  // 点赞功能
  async likeArticle(articleId, userAddress) {
    const key = `${articleId}-${userAddress}`;
    if (!this.data.likes.includes(key)) {
      this.data.likes.push(key);
      
      // 更新文章点赞数
      const article = await this.getIndividualArticle(articleId);
      if (article) {
        await this.updateArticle(articleId, { 
          likes: (article.likes || 0) + 1 
        });
      }
      
      this.saveData();
    }
  }

  async unlikeArticle(articleId, userAddress) {
    const key = `${articleId}-${userAddress}`;
    this.data.likes = this.data.likes.filter(like => like !== key);
    
    // 更新文章点赞数
    const article = await this.getIndividualArticle(articleId);
    if (article && article.likes > 0) {
      await this.updateArticle(articleId, { 
        likes: article.likes - 1 
      });
    }
    
    this.saveData();
  }

  async hasUserLikedArticle(articleId, userAddress) {
    const key = `${articleId}-${userAddress}`;
    return this.data.likes.includes(key);
  }

  // 分类相关
  async getCategories() {
    return this.data.categories;
  }

  async getCategoryBySlug(slug) {
    return this.data.categories.find(cat => cat.slug === slug) || null;
  }

  // 搜索功能
  async searchArticles(query, options = {}) {
    const { category, author, limit = 20, offset = 0 } = options;
    const lowerQuery = query.toLowerCase();
    
    let results = this.data.individualArticles.filter(article => {
      if (article.isDraft) return false;
      
      const matchesQuery = !query || 
        article.title.toLowerCase().includes(lowerQuery) ||
        (article.content && article.content.toLowerCase().includes(lowerQuery));
      
      const matchesCategory = !category || 
        (article.categories && article.categories.includes(category));
      
      const matchesAuthor = !author || 
        article.authorAddress === author;
      
      return matchesQuery && matchesCategory && matchesAuthor;
    });
    
    return results
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(offset, offset + limit);
  }
}

// 导出单例实例
module.exports = new MockDatabase();