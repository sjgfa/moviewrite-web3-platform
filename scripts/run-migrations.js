const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// PostgreSQL连接配置
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/moviewrite',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 运行迁移
async function runMigrations() {
  console.log('🔄 Running database migrations...\n');
  
  try {
    // 创建迁移历史表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migration_history (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 获取所有迁移文件
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${files.length} migration files\n`);
    
    // 检查并运行每个迁移
    for (const file of files) {
      // 检查是否已经运行过
      const result = await pool.query(
        'SELECT * FROM migration_history WHERE filename = $1',
        [file]
      );
      
      if (result.rows.length > 0) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }
      
      // 读取并执行迁移
      console.log(`▶️  Running ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      try {
        await pool.query('BEGIN');
        await pool.query(sql);
        await pool.query(
          'INSERT INTO migration_history (filename) VALUES ($1)',
          [file]
        );
        await pool.query('COMMIT');
        console.log(`✅ ${file} completed successfully\n`);
      } catch (error) {
        await pool.query('ROLLBACK');
        console.error(`❌ Error in ${file}:`, error.message);
        throw error;
      }
    }
    
    console.log('✨ All migrations completed successfully!');
    
    // 显示数据库状态
    console.log('\n📊 Database Status:');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\nTables:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };