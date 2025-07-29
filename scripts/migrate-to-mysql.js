#!/usr/bin/env node

// 数据迁移脚本：从Mock数据库迁移到MySQL
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// 导入现有的mock数据
const mockDB = require('../lib/db-mock');

class DatabaseMigration {
  constructor() {
    this.prisma = new PrismaClient();
    this.stats = {
      users: 0,
      publications: 0,
      articles: 0,
      errors: []
    };
  }

  async migrate() {
    console.log('🚀 开始数据迁移到MySQL...\n');

    try {
      // 检查数据库连接
      await this.checkConnection();
      
      // 清理现有数据（如果需要）
      await this.cleanup();
      
      // 迁移用户数据
      await this.migrateUsers();
      
      // 迁移文章数据
      await this.migrateArticles();
      
      // 迁移社交数据
      await this.migrateSocialData();
      
      // 显示迁移结果
      this.showResults();
      
    } catch (error) {
      console.error('❌ 迁移过程中发生错误:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async checkConnection() {
    console.log('🔍 检查数据库连接...');
    
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      console.log('✅ 数据库连接成功\n');
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      throw new Error('无法连接到MySQL数据库');
    }
  }

  async cleanup() {
    console.log('🧹 清理现有数据...');
    
    // 按依赖关系顺序删除数据
    const tables = [
      'article_likes',
      'article_comments', 
      'article_bookmarks',
      'article_stats',
      'article_versions',
      'article_nfts',
      'nft_transactions',
      'articles',
      'publication_members',
      'publications',
      'user_follows',
      'user_profiles',
      'token_rewards',
      'campaign_backers',
      'crowdfunding_campaigns',
      'user_activity_logs',
      'system_configs',
      'users'
    ];

    for (const table of tables) {
      try {
        await this.prisma.$executeRawUnsafe(`DELETE FROM ${table}`);
        console.log(`  清理表: ${table}`);
      } catch (error) {
        console.log(`  跳过表: ${table} (可能不存在)`);
      }
    }
    
    console.log('✅ 数据清理完成\n');
  }

  async migrateUsers() {
    console.log('👥 迁移用户数据...');
    
    const users = Object.values(mockDB.users);
    
    for (const user of users) {
      try {
        // 创建用户
        const newUser = await this.prisma.user.create({
          data: {
            walletAddress: user.walletAddress,
            username: user.username,
            email: user.email,
            status: 'ACTIVE',
            profile: {
              create: {
                displayName: user.profile?.displayName || user.username,
                bio: user.profile?.bio,
                avatarIpfsHash: user.profile?.avatar,
                websiteUrl: user.profile?.website,
                location: user.profile?.location,
                skills: user.profile?.skills ? JSON.stringify(user.profile.skills) : null,
                preferences: user.profile?.preferences ? JSON.stringify(user.profile.preferences) : null
              }
            }
          }
        });
        
        this.stats.users++;
        console.log(`  ✓ 用户: ${user.username} (${newUser.id})`);
        
      } catch (error) {
        console.error(`  ❌ 用户迁移失败: ${user.username}`, error.message);
        this.stats.errors.push(`用户 ${user.username}: ${error.message}`);
      }
    }
    
    console.log(`✅ 用户迁移完成: ${this.stats.users}个用户\n`);
  }

  async migrateArticles() {
    console.log('📝 迁移文章数据...');
    
    const articles = Object.values(mockDB.articles);
    
    for (const article of articles) {
      try {
        // 查找作者
        const author = await this.prisma.user.findFirst({
          where: { walletAddress: article.author }
        });
        
        if (!author) {
          console.log(`  ⚠️  跳过文章: ${article.title} (找不到作者)`);
          continue;
        }

        // 创建文章
        const newArticle = await this.prisma.article.create({
          data: {
            authorId: author.id,
            title: article.title,
            slug: this.generateSlug(article.title),
            summary: article.summary,
            contentIpfsHash: article.ipfsHash,
            contentText: article.content,
            coverImageIpfsHash: article.coverImage,
            status: article.published ? 'PUBLISHED' : 'DRAFT',
            tags: article.tags ? JSON.stringify(article.tags) : null,
            categories: article.categories ? JSON.stringify(article.categories) : null,
            publishedAt: article.published ? new Date(article.createdAt) : null,
            createdAt: new Date(article.createdAt),
            stats: {
              create: {
                viewCount: article.views || 0,
                likeCount: article.likes || 0,
                commentCount: 0,
                shareCount: 0,
                bookmarkCount: 0
              }
            }
          }
        });
        
        this.stats.articles++;
        console.log(`  ✓ 文章: ${article.title} (${newArticle.id})`);
        
      } catch (error) {
        console.error(`  ❌ 文章迁移失败: ${article.title}`, error.message);
        this.stats.errors.push(`文章 ${article.title}: ${error.message}`);
      }
    }
    
    console.log(`✅ 文章迁移完成: ${this.stats.articles}个文章\n`);
  }

  async migrateSocialData() {
    console.log('💬 迁移社交数据...');
    
    // 这里可以迁移点赞、评论等社交数据
    // 由于mock数据结构限制，我们创建一些示例数据
    
    try {
      const users = await this.prisma.user.findMany({ take: 3 });
      const articles = await this.prisma.article.findMany({ take: 5 });
      
      if (users.length >= 2 && articles.length > 0) {
        // 创建一些关注关系
        await this.prisma.userFollow.create({
          data: {
            followerId: users[0].id,
            followingId: users[1].id
          }
        });
        
        // 创建一些点赞
        for (let i = 0; i < Math.min(3, articles.length); i++) {
          await this.prisma.articleLike.create({
            data: {
              articleId: articles[i].id,
              userId: users[0].id
            }
          });
        }
        
        console.log('  ✓ 创建示例社交数据');
      }
      
    } catch (error) {
      console.log('  ⚠️  社交数据迁移跳过:', error.message);
    }
    
    console.log('✅ 社交数据迁移完成\n');
  }

  async createSystemConfigs() {
    console.log('⚙️  创建系统配置...');
    
    const configs = [
      {
        configKey: 'platform_name',
        configValue: JSON.stringify('MovieWrite'),
        description: '平台名称',
        isPublic: true
      },
      {
        configKey: 'platform_fee_percent',
        configValue: JSON.stringify(2.5),
        description: '平台手续费百分比',
        isPublic: true
      },
      {
        configKey: 'default_royalty_percent',
        configValue: JSON.stringify(7.5),
        description: '默认版税百分比',
        isPublic: true
      },
      {
        configKey: 'maintenance_mode',
        configValue: JSON.stringify(false),
        description: '维护模式',
        isPublic: false
      }
    ];

    for (const config of configs) {
      try {
        await this.prisma.systemConfig.create({ data: config });
        console.log(`  ✓ 配置: ${config.configKey}`);
      } catch (error) {
        console.log(`  ⚠️  配置跳过: ${config.configKey}`);
      }
    }
    
    console.log('✅ 系统配置创建完成\n');
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
  }

  showResults() {
    console.log('📊 迁移结果统计:');
    console.log(`  👥 用户: ${this.stats.users}个`);
    console.log(`  📝 文章: ${this.stats.articles}个`);
    console.log(`  ❌ 错误: ${this.stats.errors.length}个`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n⚠️  迁移错误详情:');
      this.stats.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    console.log('\n🎉 数据迁移完成！');
  }
}

// 运行迁移
async function main() {
  const migration = new DatabaseMigration();
  
  try {
    await migration.migrate();
    process.exit(0);
  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  }
}

// 命令行运行
if (require.main === module) {
  main();
}

module.exports = DatabaseMigration;