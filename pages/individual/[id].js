import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

export default function IndividualArticlePage() {
  const router = useRouter();
  const { id } = router.query;
  const { address } = useAccount();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  // 获取文章数据
  useEffect(() => {
    if (!id) return;
    
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      
      // 获取文章
      const articleRes = await fetch(`/api/articles/individual/${id}`);
      if (!articleRes.ok) {
        throw new Error('Article not found');
      }
      
      const articleData = await articleRes.json();
      setArticle(articleData.article);
      setLikes(articleData.article.likes || 0);
      
      // 获取作者信息
      if (articleData.article.authorAddress) {
        const profileRes = await fetch(`/api/users/profile?address=${articleData.article.authorAddress}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setAuthorProfile(profileData.profile);
        }
      }
      
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Failed to load article');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // 处理点赞
  const handleLike = async () => {
    if (!address) {
      toast.error('Please connect your wallet to like articles');
      return;
    }

    try {
      // TODO: 实现点赞API
      setHasLiked(!hasLiked);
      setLikes(hasLiked ? likes - 1 : likes + 1);
      toast.success(hasLiked ? 'Unliked' : 'Liked!');
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  // 计算阅读时间
  const calculateReadTime = (content) => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h2>
            <Link href="/">
              <a className="text-blue-600 hover:underline">Go back home</a>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{article.title} - MovieWrite</title>
        <meta name="description" content={article.content.substring(0, 160)} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.content.substring(0, 160)} />
      </Head>

      <article className="min-h-screen bg-white">
        {/* 文章头部 */}
        <header className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {article.title}
          </h1>
          
          {/* 作者信息和元数据 */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8">
            {/* 作者 */}
            <Link href={`/u/${authorProfile?.username || article.authorAddress}`}>
              <a className="flex items-center hover:text-gray-900">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3" />
                <div>
                  <div className="font-medium text-gray-900">
                    {authorProfile?.displayName || authorProfile?.username || 
                     `${article.authorAddress.slice(0, 6)}...${article.authorAddress.slice(-4)}`}
                  </div>
                  <div className="text-sm">
                    {format(new Date(article.publishedAt || article.createdAt), 'MMM d, yyyy')}
                  </div>
                </div>
              </a>
            </Link>
            
            {/* 阅读时间 */}
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {calculateReadTime(article.content)} min read
            </div>
            
            {/* 浏览量 */}
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {article.views || 0} views
            </div>
          </div>
          
          {/* 分类标签 */}
          {article.categories && article.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {article.categories.map((category, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
          
          {/* IPFS信息 */}
          {article.ipfsHash && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-center text-sm text-blue-700">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 9a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <span>Stored on IPFS: </span>
                <a 
                  href={article.ipfsUrl || `https://gateway.pinata.cloud/ipfs/${article.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 font-mono text-xs hover:underline"
                >
                  {article.ipfsHash.slice(0, 8)}...{article.ipfsHash.slice(-6)}
                </a>
              </div>
            </div>
          )}
        </header>
        
        {/* 文章内容 */}
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
        
        {/* 底部互动栏 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* 点赞和分享 */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    hasLiked 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg 
                    className="w-5 h-5" 
                    fill={hasLiked ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{likes}</span>
                </button>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 10-11.432 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>
              
              {/* 编辑按钮（仅作者可见） */}
              {address === article.authorAddress && (
                <Link href={`/write?edit=${article.id}`}>
                  <a className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Edit Article
                  </a>
                </Link>
              )}
            </div>
          </div>
        </div>
      </article>

      <style jsx global>{`
        .prose h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        
        .prose h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.75rem;
          margin-top: 2rem;
        }
        
        .prose h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          margin-top: 1.5rem;
        }
        
        .prose p {
          margin-bottom: 1rem;
          line-height: 1.8;
        }
        
        .prose blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin-left: 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .prose pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        
        .prose img {
          max-width: 100%;
          height: auto;
          margin: 2rem auto;
          border-radius: 0.5rem;
        }
        
        .prose a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .prose a:hover {
          color: #2563eb;
        }
      `}</style>
    </Layout>
  );
}