-- MovieWrite MySQL数据库架构
-- MySQL 8.0+ 版本

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- 创建数据库
CREATE DATABASE IF NOT EXISTS moviewrite_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE moviewrite_db;

-- ============================================================================
-- 1. 用户系统 (Users & Profiles)
-- ============================================================================

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
    UNIQUE KEY unique_user_profile (user_id)
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
    
    INDEX idx_follower (follower_id),
    INDEX idx_following (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. Publication系统
-- ============================================================================

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

-- ============================================================================
-- 3. 文章系统 (Articles & Content)
-- ============================================================================

-- 文章表
CREATE TABLE articles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    author_id CHAR(36) NOT NULL,
    publication_id CHAR(36),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    summary TEXT,
    content_ipfs_hash VARCHAR(100),
    content_text LONGTEXT, -- 用于搜索
    cover_image_ipfs_hash VARCHAR(100),
    reading_time_minutes INT DEFAULT 0,
    status ENUM('draft', 'published', 'archived', 'deleted') DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    tags JSON,
    categories JSON,
    metadata JSON,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE SET NULL,
    UNIQUE KEY unique_publication_slug (publication_id, slug),
    
    INDEX idx_author_status (author_id, status),
    INDEX idx_publication_status (publication_id, status),
    INDEX idx_published_at (published_at DESC),
    INDEX idx_status_featured (status, is_featured),
    FULLTEXT INDEX ft_title_content (title, content_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文章版本历史表
CREATE TABLE article_versions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    article_id CHAR(36) NOT NULL,
    version_number INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    content_ipfs_hash VARCHAR(100),
    changes_summary TEXT,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_article_version (article_id, version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文章统计表
CREATE TABLE article_stats (
    article_id CHAR(36) PRIMARY KEY,
    view_count BIGINT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    share_count INT DEFAULT 0,
    bookmark_count INT DEFAULT 0,
    read_time_total BIGINT DEFAULT 0,
    engagement_score DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. NFT系统
-- ============================================================================

-- 文章NFT表
CREATE TABLE article_nfts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    article_id CHAR(36) NOT NULL,
    token_id BIGINT UNIQUE NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    owner_address VARCHAR(42) NOT NULL,
    creator_address VARCHAR(42) NOT NULL,
    status ENUM('minted', 'listed', 'sold', 'burned') DEFAULT 'minted',
    mint_price DECIMAL(20,8),
    current_price DECIMAL(20,8),
    metadata_uri TEXT,
    royalty_percentage DECIMAL(5,2) DEFAULT 7.5,
    transaction_hash VARCHAR(66),
    block_number BIGINT,
    minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_sale_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    INDEX idx_contract_token (contract_address, token_id),
    INDEX idx_owner_status (owner_address, status),
    INDEX idx_article (article_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NFT交易历史表
CREATE TABLE nft_transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nft_id CHAR(36) NOT NULL,
    transaction_type ENUM('mint', 'transfer', 'sale', 'burn') NOT NULL,
    from_address VARCHAR(42),
    to_address VARCHAR(42) NOT NULL,
    price DECIMAL(20,8),
    platform_fee DECIMAL(20,8),
    royalty_fee DECIMAL(20,8),
    transaction_hash VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    gas_used BIGINT,
    gas_price DECIMAL(20,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (nft_id) REFERENCES article_nfts(id) ON DELETE CASCADE,
    INDEX idx_nft_type (nft_id, transaction_type),
    INDEX idx_from_address (from_address),
    INDEX idx_to_address (to_address),
    INDEX idx_transaction_hash (transaction_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. 社交互动系统
-- ============================================================================

-- 点赞表
CREATE TABLE article_likes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    article_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (article_id, user_id),
    
    INDEX idx_article (article_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评论表
CREATE TABLE article_comments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    article_id CHAR(36) NOT NULL,
    author_id CHAR(36) NOT NULL,
    parent_id CHAR(36),
    content TEXT NOT NULL,
    content_ipfs_hash VARCHAR(100),
    is_edited BOOLEAN DEFAULT FALSE,
    like_count INT DEFAULT 0,
    reply_count INT DEFAULT 0,
    status ENUM('active', 'hidden', 'deleted', 'flagged') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES article_comments(id) ON DELETE CASCADE,
    
    INDEX idx_article (article_id),
    INDEX idx_author (author_id),
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 书签表
CREATE TABLE article_bookmarks (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    article_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    collection_name VARCHAR(100) DEFAULT 'default',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_bookmark (article_id, user_id),
    
    INDEX idx_user_collection (user_id, collection_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. 经济系统
-- ============================================================================

-- 众筹活动表
CREATE TABLE crowdfunding_campaigns (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    creator_id CHAR(36) NOT NULL,
    publication_id CHAR(36),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    goal_amount DECIMAL(20,8) NOT NULL,
    raised_amount DECIMAL(20,8) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'ETH',
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status ENUM('draft', 'active', 'successful', 'failed', 'cancelled') DEFAULT 'draft',
    contract_address VARCHAR(42),
    milestones JSON,
    rewards JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE SET NULL,
    
    INDEX idx_creator_status (creator_id, status),
    INDEX idx_status_dates (status, start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 众筹支持者表
CREATE TABLE campaign_backers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    campaign_id CHAR(36) NOT NULL,
    backer_id CHAR(36) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    reward_tier INT,
    transaction_hash VARCHAR(66),
    backed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (campaign_id) REFERENCES crowdfunding_campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (backer_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_campaign (campaign_id),
    INDEX idx_backer (backer_id),
    INDEX idx_transaction_hash (transaction_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 代币奖励记录表
CREATE TABLE token_rewards (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    action_type ENUM(
        'article_published', 'article_liked', 'comment_posted', 
        'article_shared', 'referral_bonus', 'staking_reward',
        'governance_participation', 'milestone_completed'
    ) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    reference_id CHAR(36),
    description TEXT,
    transaction_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_action (user_id, action_type),
    INDEX idx_reference (reference_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. 系统配置和日志
-- ============================================================================

-- 系统配置表
CREATE TABLE system_configs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSON,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户活动日志表
CREATE TABLE user_activity_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id CHAR(36),
    metadata JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_action (user_id, action),
    INDEX idx_created_at (created_at),
    INDEX idx_resource (resource_type, resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. 触发器和存储过程
-- ============================================================================

-- 自动创建用户资料
DELIMITER //
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON users
    FOR EACH ROW
BEGIN
    INSERT INTO user_profiles (user_id) VALUES (NEW.id);
    INSERT INTO article_stats (article_id) 
    SELECT id FROM articles WHERE author_id = NEW.id;
END//
DELIMITER ;

-- 自动创建文章统计
DELIMITER //
CREATE TRIGGER create_article_stats_trigger
    AFTER INSERT ON articles
    FOR EACH ROW
BEGIN
    INSERT INTO article_stats (article_id) VALUES (NEW.id);
END//
DELIMITER ;

-- 更新文章点赞统计
DELIMITER //
CREATE TRIGGER update_like_stats_insert
    AFTER INSERT ON article_likes
    FOR EACH ROW
BEGIN
    UPDATE article_stats 
    SET like_count = like_count + 1, updated_at = CURRENT_TIMESTAMP 
    WHERE article_id = NEW.article_id;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER update_like_stats_delete
    AFTER DELETE ON article_likes
    FOR EACH ROW
BEGIN
    UPDATE article_stats 
    SET like_count = GREATEST(like_count - 1, 0), updated_at = CURRENT_TIMESTAMP 
    WHERE article_id = OLD.article_id;
END//
DELIMITER ;

-- 更新文章评论统计
DELIMITER //
CREATE TRIGGER update_comment_stats_insert
    AFTER INSERT ON article_comments
    FOR EACH ROW
BEGIN
    UPDATE article_stats 
    SET comment_count = comment_count + 1, updated_at = CURRENT_TIMESTAMP 
    WHERE article_id = NEW.article_id;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER update_comment_stats_delete
    AFTER DELETE ON article_comments
    FOR EACH ROW
BEGIN
    UPDATE article_stats 
    SET comment_count = GREATEST(comment_count - 1, 0), updated_at = CURRENT_TIMESTAMP 
    WHERE article_id = OLD.article_id;
END//
DELIMITER ;

-- 更新文章书签统计
DELIMITER //
CREATE TRIGGER update_bookmark_stats_insert
    AFTER INSERT ON article_bookmarks
    FOR EACH ROW
BEGIN
    UPDATE article_stats 
    SET bookmark_count = bookmark_count + 1, updated_at = CURRENT_TIMESTAMP 
    WHERE article_id = NEW.article_id;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER update_bookmark_stats_delete
    AFTER DELETE ON article_bookmarks
    FOR EACH ROW
BEGIN
    UPDATE article_stats 
    SET bookmark_count = GREATEST(bookmark_count - 1, 0), updated_at = CURRENT_TIMESTAMP 
    WHERE article_id = OLD.article_id;
END//
DELIMITER ;

-- ============================================================================
-- 9. 初始数据插入
-- ============================================================================

-- 插入系统配置
INSERT INTO system_configs (config_key, config_value, description, is_public) VALUES
('platform_name', '"MovieWrite"', '平台名称', TRUE),
('platform_fee_percent', '2.5', '平台手续费百分比', TRUE),
('default_royalty_percent', '7.5', '默认版税百分比', TRUE),
('max_upload_size', '10485760', '最大上传文件大小(bytes)', FALSE),
('supported_currencies', '["ETH", "MATIC", "BNB"]', '支持的加密货币', TRUE),
('maintenance_mode', 'false', '维护模式', FALSE);

-- 创建默认管理员用户 (如果需要)
-- INSERT INTO users (id, wallet_address, username, status) VALUES
-- ('admin-user-id', '0x0000000000000000000000000000000000000000', 'admin', 'active');

-- ============================================================================
-- 10. 视图和查询优化
-- ============================================================================

-- 文章详情视图
CREATE VIEW article_details_view AS
SELECT 
    a.id,
    a.title,
    a.slug,
    a.summary,
    a.content_ipfs_hash,
    a.cover_image_ipfs_hash,
    a.status,
    a.is_featured,
    a.is_premium,
    a.tags,
    a.categories,
    a.published_at,
    a.created_at,
    a.updated_at,
    u.username as author_username,
    up.display_name as author_display_name,
    up.avatar_ipfs_hash as author_avatar,
    p.name as publication_name,
    p.slug as publication_slug,
    p.logo_ipfs_hash as publication_logo,
    ast.view_count,
    ast.like_count,
    ast.comment_count,
    ast.bookmark_count,
    ast.engagement_score
FROM articles a
JOIN users u ON a.author_id = u.id
JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN publications p ON a.publication_id = p.id
LEFT JOIN article_stats ast ON a.id = ast.article_id
WHERE a.status = 'published';

-- 用户统计视图
CREATE VIEW user_stats_view AS
SELECT 
    u.id,
    u.username,
    up.display_name,
    COUNT(DISTINCT a.id) as article_count,
    COUNT(DISTINCT af.following_id) as following_count,
    COUNT(DISTINCT afr.follower_id) as follower_count,
    COALESCE(SUM(ast.view_count), 0) as total_views,
    COALESCE(SUM(ast.like_count), 0) as total_likes
FROM users u
JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN articles a ON u.id = a.author_id AND a.status = 'published'
LEFT JOIN user_follows af ON u.id = af.follower_id
LEFT JOIN user_follows afr ON u.id = afr.following_id
LEFT JOIN article_stats ast ON a.id = ast.article_id
GROUP BY u.id, u.username, up.display_name;

-- ============================================================================
-- 数据库架构创建完成
-- ============================================================================