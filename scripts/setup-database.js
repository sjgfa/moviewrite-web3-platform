#!/usr/bin/env node

// 数据库设置和初始化脚本
const { dbManager } = require('../lib/database');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

class DatabaseSetup {
  constructor() {
    this.steps = [
      { name: '检查环境变量', method: 'checkEnvironment' },
      { name: '测试数据库连接', method: 'testConnection' },
      { name: '生成Prisma客户端', method: 'generatePrismaClient' },
      { name: '执行数据库迁移', method: 'runMigrations' },
      { name: '初始化系统数据', method: 'seedDatabase' },
      { name: '验证数据库设置', method: 'verifySetup' }
    ];
  }

  async setup() {
    console.log('🚀 开始设置MovieWrite数据库...\n');

    for (const step of this.steps) {
      try {
        console.log(`📋 ${step.name}...`);
        await this[step.method]();
        console.log(`✅ ${step.name}完成\n`);
      } catch (error) {
        console.error(`❌ ${step.name}失败:`, error.message);
        throw error;
      }
    }

    console.log('🎉 数据库设置完成！');
  }

  async checkEnvironment() {
    const requiredVars = ['DATABASE_URL'];
    const missingVars = [];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      throw new Error(`缺少必要的环境变量: ${missingVars.join(', ')}`);
    }

    console.log('  ✓ 环境变量检查通过');
  }

  async testConnection() {
    try {
      await dbManager.initialize();
      const health = await dbManager.healthCheck();
      
      if (health.status !== 'healthy') {
        throw new Error(health.message);
      }

      console.log(`  ✓ 数据库连接正常 (响应时间: ${health.responseTime})`);
    } catch (error) {
      throw new Error(`数据库连接失败: ${error.message}`);
    }
  }

  async generatePrismaClient() {
    try {
      console.log('  🔄 生成Prisma客户端...');
      await execAsync('npx prisma generate');
      console.log('  ✓ Prisma客户端生成完成');
    } catch (error) {
      throw new Error(`Prisma客户端生成失败: ${error.message}`);
    }
  }

  async runMigrations() {
    try {
      console.log('  🔄 检查迁移状态...');
      
      // 检查是否需要创建迁移
      try {
        await execAsync('npx prisma migrate status');
      } catch (error) {
        if (error.message.includes('not in sync')) {
          console.log('  🔄 创建初始迁移...');
          await execAsync('npx prisma migrate dev --name init');
        }
      }

      console.log('  ✓ 数据库迁移完成');
    } catch (error) {
      throw new Error(`数据库迁移失败: ${error.message}`);
    }
  }

  async seedDatabase() {
    try {
      const db = dbManager.getInstance();
      
      console.log('  🌱 创建系统配置...');
      await this.createSystemConfigs(db);
      
      console.log('  🌱 创建示例数据...');
      await this.createSampleData(db);
      
      console.log('  ✓ 数据库种子数据创建完成');
    } catch (error) {
      throw new Error(`种子数据创建失败: ${error.message}`);
    }
  }

  async createSystemConfigs(db) {
    const configs = [
      {
        configKey: 'platform_name',
        configValue: '"MovieWrite"',
        description: '平台名称',
        isPublic: true
      },
      {
        configKey: 'platform_fee_percent',
        configValue: '2.5',
        description: '平台手续费百分比',
        isPublic: true
      },
      {
        configKey: 'default_royalty_percent',
        configValue: '7.5',
        description: '默认版税百分比',
        isPublic: true
      },
      {
        configKey: 'max_upload_size',
        configValue: '10485760',
        description: '最大上传文件大小(bytes)',
        isPublic: false
      },
      {
        configKey: 'supported_currencies',
        configValue: '["ETH", "MATIC", "BNB"]',
        description: '支持的加密货币',
        isPublic: true
      },
      {
        configKey: 'maintenance_mode',
        configValue: 'false',
        description: '维护模式',
        isPublic: false
      },
      {
        configKey: 'enable_registrations',
        configValue: 'true',
        description: '是否开放注册',
        isPublic: true
      },
      {
        configKey: 'enable_nft_minting',
        configValue: 'true',
        description: '是否开启NFT铸造',
        isPublic: true
      }
    ];

    for (const config of configs) {
      try {
        await db.systemConfig.upsert({
          where: { configKey: config.configKey },
          update: config,
          create: config
        });
      } catch (error) {
        console.log(`    ⚠️  配置 ${config.configKey} 创建失败:`, error.message);
      }
    }
  }

  async createSampleData(db) {
    // 仅在开发环境创建示例数据
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    try {
      // 检查是否已有用户
      const userCount = await db.user.count();
      if (userCount > 0) {
        console.log('    ✓ 已有用户数据，跳过示例数据创建');
        return;
      }

      // 创建示例用户
      const sampleUser = await db.user.create({
        data: {
          walletAddress: '0x1234567890123456789012345678901234567890',
          username: 'demo_user',
          email: 'demo@moviewrite.com',
          status: 'ACTIVE',
          profile: {
            create: {
              displayName: 'Demo User',
              bio: '这是一个示例用户账户',
              skills: JSON.stringify(['Web3', 'Writing', 'Movies']),
              preferences: JSON.stringify({ theme: 'light', language: 'zh' })
            }
          }
        }
      });

      // 创建示例Publication
      const samplePublication = await db.publication.create({
        data: {
          ownerId: sampleUser.id,
          name: 'MovieWrite官方',
          slug: 'moviewrite-official',
          description: '电影写作平台官方Publication',
          type: 'ORGANIZATION',
          status: 'ACTIVE',
          verified: true,
          settings: JSON.stringify({ 
            allowComments: true, 
            requireApproval: false 
          }),
          themeConfig: JSON.stringify({ 
            primaryColor: '#6366f1', 
            fontFamily: 'Inter' 
          })
        }
      });

      // 创建示例文章
      const sampleArticle = await db.article.create({
        data: {
          authorId: sampleUser.id,
          publicationId: samplePublication.id,
          title: '欢迎来到MovieWrite！',
          slug: 'welcome-to-moviewrite',
          summary: '了解MovieWrite平台的功能和特色',
          contentText: '这是一篇示例文章，展示了MovieWrite平台的基本功能...',
          status: 'PUBLISHED',
          tags: JSON.stringify(['welcome', 'tutorial', 'moviewrite']),
          categories: JSON.stringify(['announcements']),
          publishedAt: new Date(),
          stats: {
            create: {
              viewCount: 0,
              likeCount: 0,
              commentCount: 0
            }
          }
        }
      });

      console.log('    ✓ 示例数据创建完成');
      console.log(`      - 用户: ${sampleUser.username}`);
      console.log(`      - Publication: ${samplePublication.name}`);
      console.log(`      - 文章: ${sampleArticle.title}`);

    } catch (error) {
      console.log('    ⚠️  示例数据创建失败:', error.message);
    }
  }

  async verifySetup() {
    try {
      const db = dbManager.getInstance();
      
      // 验证各个表是否正常
      const stats = await db.$transaction([
        db.user.count(),
        db.publication.count(),
        db.article.count(),
        db.systemConfig.count()
      ]);

      console.log('  📊 数据库状态:');
      console.log(`    - 用户: ${stats[0]}个`);
      console.log(`    - Publications: ${stats[1]}个`);
      console.log(`    - 文章: ${stats[2]}个`);
      console.log(`    - 系统配置: ${stats[3]}个`);

      // 验证系统配置
      const platformName = await db.systemConfig.findUnique({
        where: { configKey: 'platform_name' }
      });

      if (!platformName) {
        throw new Error('系统配置未正确创建');
      }

      console.log('  ✓ 数据库验证通过');
    } catch (error) {
      throw new Error(`数据库验证失败: ${error.message}`);
    }
  }

  // 清理数据库（仅开发环境）
  async clean() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('生产环境不允许清理数据库');
    }

    console.log('🧹 清理数据库...');

    try {
      await dbManager.reset();
      console.log('✅ 数据库清理完成');
    } catch (error) {
      console.error('❌ 数据库清理失败:', error.message);
      throw error;
    }
  }

  // 备份数据库
  async backup(outputPath) {
    console.log('💾 备份数据库...');

    try {
      const backupFile = await dbManager.backup(outputPath);
      console.log(`✅ 数据库备份完成: ${backupFile}`);
      return backupFile;
    } catch (error) {
      console.error('❌ 数据库备份失败:', error.message);
      throw error;
    }
  }
}

// 命令行接口
async function main() {
  const command = process.argv[2];
  const setup = new DatabaseSetup();

  try {
    switch (command) {
      case 'setup':
        await setup.setup();
        break;
      
      case 'clean':
        await setup.clean();
        break;
      
      case 'backup':
        const outputPath = process.argv[3];
        await setup.backup(outputPath);
        break;
      
      case 'health':
        await dbManager.initialize();
        const health = await dbManager.healthCheck();
        console.log('数据库健康状态:', health);
        break;
      
      case 'stats':
        await dbManager.initialize();
        const stats = await dbManager.getStats();
        console.log('数据库统计:', stats);
        break;
      
      default:
        console.log(`
MovieWrite 数据库管理工具

用法:
  node scripts/setup-database.js <command>

命令:
  setup   - 完整设置数据库
  clean   - 清理数据库 (仅开发环境)
  backup  - 备份数据库
  health  - 检查数据库健康状态
  stats   - 显示数据库统计信息

示例:
  node scripts/setup-database.js setup
  node scripts/setup-database.js backup ./backups/
        `);
    }

    process.exit(0);
  } catch (error) {
    console.error('操作失败:', error.message);
    process.exit(1);
  } finally {
    await dbManager.disconnect();
  }
}

// 如果直接运行脚本
if (require.main === module) {
  main();
}

module.exports = DatabaseSetup;