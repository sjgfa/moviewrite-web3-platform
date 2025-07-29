# 🗄️ MovieWrite MySQL数据库架构设计

## 📋 设计概览

**数据库系统**: MySQL 8.0+  
**ORM框架**: Prisma  
**缓存层**: Redis  
**搜索引擎**: Elasticsearch  

## 🏗️ 核心表结构设计

### 1. 用户系统 (Users & Profiles)

```sql
-- 用户基础表
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(50) UNIQUE,
    status ENUM('active', 'suspended', 'banned', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_wallet_address (wallet_address),
    INDEX idx_username (username),
    INDEX idx_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户资料表
CREATE TABLE user_profiles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_ipfs_hash VARCHAR(100),
    banner_ipfs_hash VARCHAR(100),
    website_url VARCHAR(500),
    twitter_handle VARCHAR(50),
    location VARCHAR(100),
    skills JSON,
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户关注关系表
CREATE TABLE user_follows (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    follower_id CHAR(36) NOT NULL,
    following_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_follow (follower_id, following_id),
    CHECK (follower_id != following_id),
    
    INDEX idx_follower (follower_id),
    INDEX idx_following (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Publication系统

```sql
-- Publication表
CREATE TABLE publications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    owner_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_ipfs_hash VARCHAR(100),
    banner_ipfs_hash VARCHAR(100),
    type ENUM('individual', 'collaborative', 'organization') DEFAULT 'individual',
    status ENUM('draft', 'active', 'archived', 'suspended') DEFAULT 'draft',
    settings JSON,
    theme_config JSON,
    custom_domain VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_status (owner_id, status),
    INDEX idx_slug (slug),
    INDEX idx_type_status (type, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Publication成员表
CREATE TABLE publication_members (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    publication_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    role ENUM('owner', 'admin', 'editor', 'writer', 'contributor') DEFAULT 'writer',
    permissions JSON,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_member (publication_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. 文章系统 (Articles & Content)

```sql
-- 文章状态枚举
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived', 'deleted');

-- 文章表
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    publication_id UUID REFERENCES publications(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    summary TEXT,
    content_ipfs_hash VARCHAR(100),
    content_text TEXT, -- 用于搜索
    cover_image_ipfs_hash VARCHAR(100),
    reading_time_minutes INTEGER DEFAULT 0,
    status article_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    tags JSONB DEFAULT '[]',
    categories JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 唯一约束：同一publication下slug唯一
    UNIQUE(publication_id, slug)
);

-- 文章版本历史表
CREATE TABLE article_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    content_ipfs_hash VARCHAR(100),
    changes_summary TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(article_id, version_number)
);

-- 文章统计表
CREATE TABLE article_stats (
    article_id UUID PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE,
    view_count BIGINT DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    read_time_total BIGINT DEFAULT 0, -- 总阅读时间（秒）
    engagement_score DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. NFT系统

```sql
-- NFT状态枚举
CREATE TYPE nft_status AS ENUM ('minted', 'listed', 'sold', 'burned');

-- 文章NFT表
CREATE TABLE article_nfts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    token_id BIGINT UNIQUE NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    owner_address VARCHAR(42) NOT NULL,
    creator_address VARCHAR(42) NOT NULL,
    status nft_status DEFAULT 'minted',
    mint_price DECIMAL(20,8),
    current_price DECIMAL(20,8),
    metadata_uri TEXT,
    royalty_percentage DECIMAL(5,2) DEFAULT 7.5,
    transaction_hash VARCHAR(66),
    block_number BIGINT,
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sale_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NFT交易历史表
CREATE TABLE nft_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nft_id UUID REFERENCES article_nfts(id) ON DELETE CASCADE,
    transaction_type nft_transaction_type NOT NULL,
    from_address VARCHAR(42),
    to_address VARCHAR(42) NOT NULL,
    price DECIMAL(20,8),
    platform_fee DECIMAL(20,8),
    royalty_fee DECIMAL(20,8),
    transaction_hash VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    gas_used BIGINT,
    gas_price DECIMAL(20,8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NFT交易类型枚举
CREATE TYPE nft_transaction_type AS ENUM ('mint', 'transfer', 'sale', 'burn');
```

### 5. 社交互动系统

```sql
-- 点赞表
CREATE TABLE article_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, user_id)
);

-- 评论表
CREATE TABLE article_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES article_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_ipfs_hash VARCHAR(100),
    is_edited BOOLEAN DEFAULT FALSE,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    status comment_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 评论状态枚举
CREATE TYPE comment_status AS ENUM ('active', 'hidden', 'deleted', 'flagged');

-- 书签表
CREATE TABLE article_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    collection_name VARCHAR(100) DEFAULT 'default',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, user_id)
);
```

### 6. 经济系统

```sql
-- 众筹活动表
CREATE TABLE crowdfunding_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    publication_id UUID REFERENCES publications(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    goal_amount DECIMAL(20,8) NOT NULL,
    raised_amount DECIMAL(20,8) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'ETH',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status campaign_status DEFAULT 'draft',
    contract_address VARCHAR(42),
    milestones JSONB DEFAULT '[]',
    rewards JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 众筹状态枚举
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'successful', 'failed', 'cancelled');

-- 众筹支持者表
CREATE TABLE campaign_backers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES crowdfunding_campaigns(id) ON DELETE CASCADE,
    backer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(20,8) NOT NULL,
    reward_tier INTEGER,
    transaction_hash VARCHAR(66),
    backed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, backer_id, transaction_hash)
);

-- 代币奖励记录表
CREATE TABLE token_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action_type reward_action_type NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    reference_id UUID, -- 关联的文章/评论/活动ID
    description TEXT,
    transaction_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 奖励行为类型枚举
CREATE TYPE reward_action_type AS ENUM (
    'article_published', 'article_liked', 'comment_posted', 
    'article_shared', 'referral_bonus', 'staking_reward',
    'governance_participation', 'milestone_completed'
);
```

## 🔗 关系和约束设计

### 索引策略

```sql
-- 用户相关索引
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status_created ON users(status, created_at);

-- 文章相关索引
CREATE INDEX idx_articles_author_status ON articles(author_id, status);
CREATE INDEX idx_articles_publication_status ON articles(publication_id, status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_tags ON articles USING GIN(tags);
CREATE INDEX idx_articles_categories ON articles USING GIN(categories);
CREATE INDEX idx_articles_full_text ON articles USING GIN(to_tsvector('english', title || ' ' || COALESCE(content_text, '')));

-- Publication相关索引
CREATE INDEX idx_publications_owner_status ON publications(owner_id, status);
CREATE INDEX idx_publications_slug ON publications(slug);
CREATE INDEX idx_publications_type_status ON publications(type, status);

-- NFT相关索引
CREATE INDEX idx_nfts_contract_token ON article_nfts(contract_address, token_id);
CREATE INDEX idx_nfts_owner_status ON article_nfts(owner_address, status);
CREATE INDEX idx_nfts_article ON article_nfts(article_id);

-- 社交相关索引
CREATE INDEX idx_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_follows_following ON user_follows(following_id);
CREATE INDEX idx_likes_article ON article_likes(article_id);
CREATE INDEX idx_likes_user ON article_likes(user_id);
CREATE INDEX idx_comments_article ON article_comments(article_id);
CREATE INDEX idx_comments_author ON article_comments(author_id);
```

### 触发器和函数

```sql
-- 自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_publications_updated_at BEFORE UPDATE ON publications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 文章统计自动更新
CREATE OR REPLACE FUNCTION update_article_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 处理点赞、评论、书签的插入
        IF TG_TABLE_NAME = 'article_likes' THEN
            UPDATE article_stats 
            SET like_count = like_count + 1, updated_at = NOW() 
            WHERE article_id = NEW.article_id;
        ELSIF TG_TABLE_NAME = 'article_comments' THEN
            UPDATE article_stats 
            SET comment_count = comment_count + 1, updated_at = NOW() 
            WHERE article_id = NEW.article_id;
        ELSIF TG_TABLE_NAME = 'article_bookmarks' THEN
            UPDATE article_stats 
            SET bookmark_count = bookmark_count + 1, updated_at = NOW() 
            WHERE article_id = NEW.article_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 处理删除操作
        IF TG_TABLE_NAME = 'article_likes' THEN
            UPDATE article_stats 
            SET like_count = GREATEST(like_count - 1, 0), updated_at = NOW() 
            WHERE article_id = OLD.article_id;
        ELSIF TG_TABLE_NAME = 'article_comments' THEN
            UPDATE article_stats 
            SET comment_count = GREATEST(comment_count - 1, 0), updated_at = NOW() 
            WHERE article_id = OLD.article_id;
        ELSIF TG_TABLE_NAME = 'article_bookmarks' THEN
            UPDATE article_stats 
            SET bookmark_count = GREATEST(bookmark_count - 1, 0), updated_at = NOW() 
            WHERE article_id = OLD.article_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE 'plpgsql';

-- 添加统计触发器
CREATE TRIGGER trigger_update_like_stats 
    AFTER INSERT OR DELETE ON article_likes 
    FOR EACH ROW EXECUTE FUNCTION update_article_stats();

CREATE TRIGGER trigger_update_comment_stats 
    AFTER INSERT OR DELETE ON article_comments 
    FOR EACH ROW EXECUTE FUNCTION update_article_stats();

CREATE TRIGGER trigger_update_bookmark_stats 
    AFTER INSERT OR DELETE ON article_bookmarks 
    FOR EACH ROW EXECUTE FUNCTION update_article_stats();
```

## 🔒 安全和权限控制

### Row Level Security (RLS)

```sql
-- 启用RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

-- 文章访问策略
CREATE POLICY article_access_policy ON articles
    FOR SELECT
    USING (
        status = 'published' OR 
        author_id = current_setting('app.current_user_id')::UUID OR
        EXISTS (
            SELECT 1 FROM publication_members pm 
            WHERE pm.publication_id = articles.publication_id 
            AND pm.user_id = current_setting('app.current_user_id')::UUID
        )
    );

-- 文章修改策略
CREATE POLICY article_modify_policy ON articles
    FOR UPDATE
    USING (
        author_id = current_setting('app.current_user_id')::UUID OR
        EXISTS (
            SELECT 1 FROM publication_members pm 
            WHERE pm.publication_id = articles.publication_id 
            AND pm.user_id = current_setting('app.current_user_id')::UUID
            AND pm.role IN ('owner', 'admin', 'editor')
        )
    );
```

## 📊 数据分区策略

```sql
-- 按时间分区大表
CREATE TABLE article_views_partitioned (
    id UUID DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    read_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- 创建月度分区
CREATE TABLE article_views_y2024m01 PARTITION OF article_views_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE article_views_y2024m02 PARTITION OF article_views_partitioned
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

## 🚀 性能优化配置

### PostgreSQL配置建议

```ini
# postgresql.conf 关键配置
shared_buffers = 256MB                # 25% of RAM
effective_cache_size = 1GB            # 75% of RAM  
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1                # For SSD
effective_io_concurrency = 200        # For SSD

# 连接和并发
max_connections = 200
shared_preload_libraries = 'pg_stat_statements'

# 日志配置
log_min_duration_statement = 200ms
log_statement = 'mod'
log_checkpoints = on
log_connections = on
log_disconnections = on
```

## 💾 备份和恢复策略

### 备份脚本

```bash
#!/bin/bash
# backup.sh - 数据库备份脚本

BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="moviewrite_db"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 全量备份
pg_dump -h localhost -U postgres -d $DB_NAME \
    --format=custom \
    --compress=9 \
    --file="$BACKUP_DIR/moviewrite_backup_$DATE.dump"

# 删除7天前的备份
find $BACKUP_DIR -name "*.dump" -mtime +7 -delete

# 上传到云存储（可选）
# aws s3 cp "$BACKUP_DIR/moviewrite_backup_$DATE.dump" s3://backups/
```

## 🔍 监控和维护

### 性能监控查询

```sql
-- 慢查询监控
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- 表大小监控
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 索引使用情况
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

这个数据库架构设计为MovieWrite平台提供了：

1. **可扩展性**: 支持水平和垂直扩展
2. **性能**: 优化的索引和查询策略  
3. **安全性**: RLS和权限控制
4. **完整性**: 外键约束和数据验证
5. **可维护性**: 清晰的表结构和关系
6. **监控**: 内置的统计和监控功能