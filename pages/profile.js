import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAccount, useContractRead } from 'wagmi';
import { motion } from 'framer-motion';
import { 
  UserIcon,
  BookOpenIcon,
  PencilIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';
import ArticleCard from '@/components/ArticleCard';
import { CONTRACT_ADDRESSES, MOVIE_ARTICLE_ABI, REWARD_TOKEN_ABI, formatAddress, formatDateTime } from '@/lib/web3';

export default function Profile() {
  const { address, isConnected } = useAccount();
  const [userArticles, setUserArticles] = useState([]);
  const [userContributions, setUserContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('articles');
  const [mounted, setMounted] = useState(false);

  // 防止 hydration 错误
  useEffect(() => {
    setMounted(true);
  }, []);

  // 获取用户代币余额
  const { data: tokenBalance } = useContractRead({
    address: CONTRACT_ADDRESSES.REWARD_TOKEN,
    abi: REWARD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && mounted,
    watch: true,
  });

  // 获取用户贡献列表
  const { data: contributionIds } = useContractRead({
    address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
    abi: MOVIE_ARTICLE_ABI,
    functionName: 'getUserContributions',
    args: [address],
    enabled: !!address && mounted,
    watch: true,
  });

  // 获取文章总数
  const { data: totalArticles } = useContractRead({
    address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
    abi: MOVIE_ARTICLE_ABI,
    functionName: 'getTotalArticles',
    watch: true,
    enabled: mounted,
  });

  // 获取用户创建的文章
  useEffect(() => {
    if (!mounted) return; // 防止 SSR 时执行
    
    const fetchUserArticles = async () => {
      if (!totalArticles || !address) {
        setUserArticles([]);
        return;
      }

      try {
        const articlePromises = [];
        
        for (let i = 1; i <= Number(totalArticles); i++) {
          articlePromises.push(
            fetch(`/api/article/${i}`).then(res => res.json())
          );
        }

        const articlesData = await Promise.all(articlePromises);
        const userCreatedArticles = articlesData.filter(
          article => article && !article.error && 
          article.creator.toLowerCase() === address.toLowerCase()
        );
        
        setUserArticles(userCreatedArticles);
      } catch (error) {
        console.error('获取用户文章失败:', error);
      }
    };

    fetchUserArticles();
  }, [totalArticles, address, mounted]);

  // 获取用户贡献详情
  useEffect(() => {
    if (!mounted) return; // 防止 SSR 时执行
    
    const fetchUserContributions = async () => {
      if (!contributionIds || contributionIds.length === 0) {
        setUserContributions([]);
        setLoading(false);
        return;
      }

      try {
        const contributionPromises = contributionIds.map(async (contributionId) => {
          const response = await fetch(`/api/contribution/${contributionId}`);
          const contribution = await response.json();
          
          if (contribution && !contribution.error) {
            // 获取对应的文章信息
            const articleResponse = await fetch(`/api/article/${contribution.articleId}`);
            const article = await articleResponse.json();
            
            return {
              ...contribution,
              article: article && !article.error ? article : null
            };
          }
          return null;
        });

        const contributionsData = await Promise.all(contributionPromises);
        setUserContributions(contributionsData.filter(c => c !== null));
      } catch (error) {
        console.error('获取用户贡献失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserContributions();
  }, [contributionIds, mounted]);

  if (!mounted) {
    return (
      <Layout>
        <Head>
          <title>个人中心 - 电影文章共创平台</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isConnected) {
    return (
      <Layout>
        <Head>
          <title>个人中心 - 电影文章共创平台</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">请连接钱包</h3>
            <p className="mt-1 text-sm text-gray-500">
              连接您的钱包以查看个人信息
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      name: '创建文章',
      value: userArticles.length,
      icon: BookOpenIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: '贡献数量',
      value: userContributions.length,
      icon: PencilIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: '获得点赞',
      value: userContributions.reduce((sum, c) => sum + c.likes, 0),
      icon: HeartIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      name: '代币余额',
      value: tokenBalance ? `${Number(tokenBalance) / 10**18} MWT` : '0 MWT',
      icon: TrophyIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  const tabs = [
    { id: 'articles', name: '我的文章', count: userArticles.length },
    { id: 'contributions', name: '我的贡献', count: userContributions.length },
  ];

  return (
    <Layout>
      <Head>
        <title>个人中心 - 电影文章共创平台</title>
        <meta name="description" content="查看您的文章创作和贡献记录" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Profile Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center space-x-6">
              <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {formatAddress(address).slice(0, 2)}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {formatAddress(address)}
                </h1>
                <p className="text-gray-600">Web3 电影文章创作者</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center">
                    <div className={`${stat.bgColor} rounded-lg p-3`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'articles' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">我创建的文章</h2>
              {userArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userArticles.map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link href={`/article/${article.id}`}>
                        <ArticleCard {...article} />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">还没有创建文章</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    开始创建您的第一篇电影文章吧！
                  </p>
                  <div className="mt-6">
                    <Link href="/articles">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        创建文章
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contributions' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">我的贡献</h2>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : userContributions.length > 0 ? (
                <div className="space-y-6">
                  {userContributions.map((contribution, index) => (
                    <motion.div
                      key={contribution.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-sm p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <Link href={`/article/${contribution.articleId}`}>
                            <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                              {contribution.article?.title || `文章 #${contribution.articleId}`}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDateTime(contribution.timestamp)}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {contribution.isApproved && (
                            <span className="flex items-center space-x-1 text-green-600 text-sm">
                              <CheckCircleIcon className="h-4 w-4" />
                              <span>已批准</span>
                            </span>
                          )}
                          <div className="flex items-center space-x-1 text-gray-500">
                            <HeartIcon className="h-4 w-4" />
                            <span className="text-sm">{contribution.likes}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed">
                          {contribution.content.length > 200 
                            ? `${contribution.content.substring(0, 200)}...` 
                            : contribution.content
                          }
                        </p>
                      </div>
                      
                      {contribution.rewards > 0 && (
                        <div className="mt-4 flex items-center space-x-2 text-yellow-600">
                          <TrophyIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            获得奖励: {contribution.rewards} MWT
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <PencilIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">还没有贡献</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    参与文章创作，分享您的见解！
                  </p>
                  <div className="mt-6">
                    <Link href="/articles">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        浏览文章
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 