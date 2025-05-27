import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractRead } from 'wagmi';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  BookOpenIcon, 
  UsersIcon, 
  TrophyIcon,
  FilmIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';
import ArticleCard from '@/components/ArticleCard';
import CreateArticleModal from '@/components/CreateArticleModal';
import { CONTRACT_ADDRESSES, MOVIE_ARTICLE_ABI } from '@/lib/web3';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // 获取文章总数
  const { data: totalArticles } = useContractRead({
    address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
    abi: MOVIE_ARTICLE_ABI,
    functionName: 'getTotalArticles',
    watch: true,
  });

  // 获取贡献总数
  const { data: totalContributions } = useContractRead({
    address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
    abi: MOVIE_ARTICLE_ABI,
    functionName: 'getTotalContributions',
    watch: true,
  });

  // 获取特色文章（最新的几篇）
  useEffect(() => {
    const fetchFeaturedArticles = async () => {
      if (!totalArticles || totalArticles.toString() === '0') {
        setFeaturedArticles([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const articlePromises = [];
        const articlesToFetch = Math.min(Number(totalArticles), 6); // 最多显示6篇
        
        // 获取最新的文章
        for (let i = Number(totalArticles); i > Number(totalArticles) - articlesToFetch; i--) {
          articlePromises.push(
            fetch(`/api/article/${i}`).then(res => res.json())
          );
        }

        const articlesData = await Promise.all(articlePromises);
        setFeaturedArticles(articlesData.filter(article => article && !article.error));
      } catch (error) {
        console.error('获取特色文章失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedArticles();
  }, [totalArticles]);

  const stats = [
    {
      name: '活跃文章',
      value: totalArticles?.toString() || '0',
      icon: BookOpenIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: '总贡献数',
      value: totalContributions?.toString() || '0',
      icon: PencilIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: '参与用户',
      value: '128',
      icon: UsersIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: '完成文章',
      value: featuredArticles.filter(article => article.isCompleted).length.toString(),
      icon: TrophyIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <Layout>
      <Head>
        <title>电影文章共创平台 - Web3协作写作</title>
        <meta name="description" content="基于区块链的电影文章协作创作平台" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-lg">
                <FilmIcon className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold gradient-text">MovieWrite</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              电影文章
              <span className="gradient-text"> 共创平台</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              基于Web3技术的协作写作平台，让创作者们一起创作精彩的电影文章，
              通过区块链技术确保贡献的透明性和奖励的公平性。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isConnected ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>创建新文章</span>
                </motion.button>
              ) : (
                <div className="bg-white rounded-xl p-2 shadow-lg">
                  <ConnectButton />
                </div>
              )}
              
              <Link href="/articles">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-gray-50 transition-colors border"
                >
                  <BookOpenIcon className="h-5 w-5" />
                  <span>浏览文章</span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
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
      </section>

      {/* Featured Articles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {featuredArticles.length > 0 ? '最新文章' : '开始创作'}
            </h2>
            <p className="text-lg text-gray-600">
              {featuredArticles.length > 0 
                ? '发现最新的电影文章创作项目' 
                : '还没有文章，成为第一个创建者吧！'
              }
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex space-x-4">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArticles.map((article, index) => (
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
            <div className="text-center py-12">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">还没有文章</h3>
              <p className="mt-1 text-sm text-gray-500">
                成为第一个创建电影文章的人吧！
              </p>
              {isConnected && (
                <div className="mt-6">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    创建新文章
                  </button>
                </div>
              )}
            </div>
          )}

          {featuredArticles.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/articles">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"
                >
                  查看所有文章
                  <BookOpenIcon className="ml-2 h-5 w-5" />
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">平台特色</h2>
            <p className="text-lg text-gray-600">
              Web3技术驱动的协作创作体验
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-4">
                <BookOpenIcon className="h-8 w-8 text-blue-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">协作创作</h3>
              <p className="text-gray-600">
                多人接力完成文章，每个人都可以贡献自己的见解和创意
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-green-100 rounded-full p-6 w-20 h-20 mx-auto mb-4">
                <TrophyIcon className="h-8 w-8 text-green-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">公平奖励</h3>
              <p className="text-gray-600">
                基于区块链的透明奖励机制，优质贡献获得代币奖励
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="bg-purple-100 rounded-full p-6 w-20 h-20 mx-auto mb-4">
                <FilmIcon className="h-8 w-8 text-purple-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">NFT证书</h3>
              <p className="text-gray-600">
                完成的文章可以铸造为NFT，永久记录创作成果
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Create Article Modal */}
      <CreateArticleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </Layout>
  );
} 