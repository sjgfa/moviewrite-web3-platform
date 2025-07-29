// 数据库连接和配置管理
const { PrismaClient } = require('@prisma/client');

class DatabaseManager {
  constructor() {
    this.prisma = null;
    this.isConnected = false;
    this.connectionRetries = 0;
    this.maxRetries = 5;
  }

  // 初始化数据库连接
  async initialize() {
    if (this.prisma) {
      return this.prisma;
    }

    try {
      console.log('🔌 初始化数据库连接...');

      this.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        },
        errorFormat: 'pretty'
      });

      // 测试连接
      await this.testConnection();
      
      console.log('✅ 数据库连接成功');
      this.isConnected = true;
      this.connectionRetries = 0;

      return this.prisma;

    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      
      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        console.log(`🔄 重试连接... (${this.connectionRetries}/${this.maxRetries})`);
        await this.delay(2000);
        return this.initialize();
      }

      throw new Error(`数据库连接失败，已重试${this.maxRetries}次`);
    }
  }

  // 测试数据库连接
  async testConnection() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      throw new Error(`数据库连接测试失败: ${error.message}`);
    }
  }

  // 获取数据库实例
  getInstance() {
    if (!this.prisma) {
      throw new Error('数据库未初始化，请先调用 initialize()');
    }
    return this.prisma;
  }

  // 关闭数据库连接
  async disconnect() {
    if (this.prisma) {
      console.log('🔌 关闭数据库连接...');
      await this.prisma.$disconnect();
      this.prisma = null;
      this.isConnected = false;
      console.log('✅ 数据库连接已关闭');
    }
  }

  // 检查连接状态
  isReady() {
    return this.isConnected && this.prisma !== null;
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 数据库健康检查
  async healthCheck() {
    if (!this.isReady()) {
      return {
        status: 'disconnected',
        message: '数据库未连接'
      };
    }

    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;

      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        message: '数据库连接正常'
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  // 获取数据库统计信息
  async getStats() {
    if (!this.isReady()) {
      throw new Error('数据库未连接');
    }

    try {
      const [
        userCount,
        articleCount,
        publicationCount,
        commentCount,
        likeCount
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.article.count({ where: { status: 'PUBLISHED' } }),
        this.prisma.publication.count({ where: { status: 'ACTIVE' } }),
        this.prisma.articleComment.count({ where: { status: 'ACTIVE' } }),
        this.prisma.articleLike.count()
      ]);

      return {
        users: userCount,
        articles: articleCount,
        publications: publicationCount,
        comments: commentCount,
        likes: likeCount,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`获取数据库统计失败: ${error.message}`);
    }
  }

  // 执行数据库迁移
  async migrate() {
    if (!this.isReady()) {
      await this.initialize();
    }

    try {
      console.log('🔄 执行数据库迁移...');
      
      // 使用Prisma CLI执行迁移
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      await execAsync('npx prisma migrate deploy');
      console.log('✅ 数据库迁移完成');

    } catch (error) {
      console.error('❌ 数据库迁移失败:', error.message);
      throw error;
    }
  }

  // 重置数据库（仅开发环境）
  async reset() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('生产环境不允许重置数据库');
    }

    try {
      console.log('🗑️  重置数据库...');
      
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      await execAsync('npx prisma migrate reset --force');
      console.log('✅ 数据库重置完成');

    } catch (error) {
      console.error('❌ 数据库重置失败:', error.message);
      throw error;
    }
  }

  // 备份数据库
  async backup(backupPath) {
    try {
      console.log('💾 创建数据库备份...');
      
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      const dbUrl = new URL(process.env.DATABASE_URL);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = backupPath || `backup-${timestamp}.sql`;

      const command = `mysqldump -h ${dbUrl.hostname} -P ${dbUrl.port || 3306} -u ${dbUrl.username} -p${dbUrl.password} ${dbUrl.pathname.slice(1)} > ${filename}`;
      
      await execAsync(command);
      console.log(`✅ 数据库备份完成: ${filename}`);
      
      return filename;
    } catch (error) {
      console.error('❌ 数据库备份失败:', error.message);
      throw error;
    }
  }
}

// 创建单例实例
const dbManager = new DatabaseManager();

// 优雅关闭处理
process.on('SIGINT', async () => {
  console.log('\n收到关闭信号，正在关闭数据库连接...');
  await dbManager.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n收到终止信号，正在关闭数据库连接...');
  await dbManager.disconnect();
  process.exit(0);
});

module.exports = {
  DatabaseManager,
  dbManager,
  
  // 快捷方法
  async getDB() {
    if (!dbManager.isReady()) {
      await dbManager.initialize();
    }
    return dbManager.getInstance();
  },

  // 健康检查中间件
  healthCheckMiddleware() {
    return async (req, res, next) => {
      try {
        const health = await dbManager.healthCheck();
        req.dbHealth = health;
        next();
      } catch (error) {
        req.dbHealth = {
          status: 'error',
          message: error.message
        };
        next();
      }
    };
  },

  // 数据库统计中间件
  statsMiddleware() {
    return async (req, res, next) => {
      try {
        if (dbManager.isReady()) {
          req.dbStats = await dbManager.getStats();
        }
        next();
      } catch (error) {
        console.error('获取数据库统计失败:', error.message);
        next();
      }
    };
  }
};