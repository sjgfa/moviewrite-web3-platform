import Link from 'next/link';
import { format } from 'date-fns';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function IndividualArticleCard({ article, showAuthor = true }) {
  const { address } = useAccount();
  const [likes, setLikes] = useState(article.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // 处理点赞
  const handleLike = async (e) => {
    e.preventDefault(); // 防止Link导航
    
    if (!address) {
      toast.error('Please connect your wallet to like articles');
      return;
    }

    setIsLiking(true);
    try {
      // TODO: 实现点赞API
      setHasLiked(!hasLiked);
      setLikes(hasLiked ? likes - 1 : likes + 1);
      toast.success(hasLiked ? 'Unliked' : 'Liked!');
    } catch (error) {
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  // 从HTML内容中提取纯文本摘要
  const getExcerpt = (html, maxLength = 160) => {
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length > maxLength 
      ? text.substring(0, maxLength) + '...' 
      : text;
  };

  // 计算阅读时间
  const calculateReadTime = (content) => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  return (
    <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <Link href={`/article/${article.id}`}>
        <div className="p-6 cursor-pointer">
          {/* 标题 */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
            {article.title}
          </h2>

          {/* 摘要 */}
          <p className="text-gray-600 mb-4 line-clamp-3">
            {getExcerpt(article.content)}
          </p>

          {/* 元信息 */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              {/* 作者信息 */}
              {showAuthor && (
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2" />
                  <span className="font-medium">
                    {article.authorName || `${article.authorAddress.slice(0, 6)}...${article.authorAddress.slice(-4)}`}
                  </span>
                </div>
              )}

              {/* 发布时间 */}
              <time dateTime={article.publishedAt}>
                {format(new Date(article.publishedAt || article.createdAt), 'MMM d, yyyy')}
              </time>

              {/* 阅读时间 */}
              <span>{calculateReadTime(article.content)} min read</span>
            </div>

            {/* 互动数据 */}
            <div className="flex items-center space-x-4">
              {/* 浏览量 */}
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{article.views || 0}</span>
              </div>

              {/* 点赞按钮 */}
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center space-x-1 transition-colors ${
                  hasLiked ? 'text-red-500' : 'hover:text-red-500'
                }`}
              >
                <svg 
                  className="w-4 h-4" 
                  fill={hasLiked ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{likes}</span>
              </button>
            </div>
          </div>

          {/* 分类标签 */}
          {article.categories && article.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {article.categories.map((category, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* IPFS标识 */}
          {article.ipfsHash && (
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 9a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Stored on IPFS
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}