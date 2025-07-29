-- Migration: Add support for individual articles and IPFS storage
-- Date: 2024-01-29

-- Add new columns to articles table for individual article support
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS content_type VARCHAR(50) DEFAULT 'collaborative',
ADD COLUMN IF NOT EXISTS is_individual BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ipfs_hash VARCHAR(64),
ADD COLUMN IF NOT EXISTS author_address VARCHAR(42),
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_articles_content_type ON articles(content_type);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_address);
CREATE INDEX IF NOT EXISTS idx_articles_ipfs ON articles(ipfs_hash);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    address VARCHAR(42) PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(255),
    twitter_handle VARCHAR(50),
    website_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create publications table (simplified version for MVP)
CREATE TABLE IF NOT EXISTS publications (
    id SERIAL PRIMARY KEY,
    owner_address VARCHAR(42) NOT NULL REFERENCES user_profiles(address),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    cover_image_url VARCHAR(255),
    theme_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create article_categories table
CREATE TABLE IF NOT EXISTS article_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#000000',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create article_category_mapping table
CREATE TABLE IF NOT EXISTS article_category_mappings (
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES article_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, category_id)
);

-- Insert default categories
INSERT INTO article_categories (name, slug, description, color) VALUES
('Technology', 'technology', 'Articles about technology and development', '#3B82F6'),
('Blockchain', 'blockchain', 'Blockchain and Web3 related content', '#8B5CF6'),
('Movies', 'movies', 'Movie reviews and analysis', '#EF4444'),
('Entertainment', 'entertainment', 'Entertainment industry news and insights', '#F59E0B'),
('Tutorial', 'tutorial', 'How-to guides and tutorials', '#10B981'),
('Opinion', 'opinion', 'Opinion pieces and editorials', '#6366F1')
ON CONFLICT (slug) DO NOTHING;

-- Create follows table for social features
CREATE TABLE IF NOT EXISTS follows (
    id SERIAL PRIMARY KEY,
    follower_address VARCHAR(42) NOT NULL REFERENCES user_profiles(address),
    following_address VARCHAR(42) NOT NULL REFERENCES user_profiles(address),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_address, following_address),
    CHECK (follower_address != following_address)
);

-- Create article_likes table (extending existing likes system)
CREATE TABLE IF NOT EXISTS article_likes (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    user_address VARCHAR(42) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, user_address)
);

-- Create article_drafts table for autosave functionality
CREATE TABLE IF NOT EXISTS article_drafts (
    id SERIAL PRIMARY KEY,
    author_address VARCHAR(42) NOT NULL,
    title VARCHAR(500),
    content TEXT,
    metadata JSONB DEFAULT '{}',
    last_saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_publications_updated_at BEFORE UPDATE ON publications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_address);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_address);
CREATE INDEX IF NOT EXISTS idx_article_likes_article ON article_likes(article_id);
CREATE INDEX IF NOT EXISTS idx_article_likes_user ON article_likes(user_address);
CREATE INDEX IF NOT EXISTS idx_article_drafts_author ON article_drafts(author_address);

-- Add comments
COMMENT ON TABLE user_profiles IS 'User profiles for MovieWrite platform';
COMMENT ON TABLE publications IS 'User publications (similar to Mirror.xyz publications)';
COMMENT ON TABLE article_categories IS 'Categories for organizing articles';
COMMENT ON TABLE follows IS 'Social graph - who follows whom';
COMMENT ON TABLE article_drafts IS 'Auto-saved drafts for articles';