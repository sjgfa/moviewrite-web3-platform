import { useState, useEffect } from 'react';
import Head from 'next/head';
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
  const [articles, setArticles] = useState([]);

  // 获取文章总数
  const { data: totalArticles } = useContractRead({
    address: CONTRACT_ADDRESSES.movieArticle,
    abi: MOVIE_ARTICLE_ABI,
    functionName: 'getTotalArticles',
    watch: true,
  });

  // 获取贡献总数
  const { data: totalContributions } = useContractRead({
    address: CONTRACT_ADDRESSES.movieArticle,
    abi: MOVIE_ARTICLE_ABI,
    functionName: 'getTotalContributions',
    watch: true,
  });

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
      value: '23',
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
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-gray-50 transition-colors border"
              >
                <BookOpenIcon className="h-5 w-5" />
                <span>浏览文章</span>
              </motion.button>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">热门文章</h2>
            <p className="text-lg text-gray-600">
              发现最受欢迎的电影文章创作项目
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 示例文章卡片 */}
            <ArticleCard
              title="《阿凡达：水之道》深度解析"
              movieTitle="阿凡达：水之道"
              genre="科幻"
              creator="0x1234...5678"
              contributions={12}
              likes={45}
              isCompleted={false}
            />
            <ArticleCard
              title="漫威宇宙的未来展望"
              movieTitle="复仇者联盟"
              genre="动作"
              creator="0x8765...4321"
              contributions={8}
              likes={32}
              isCompleted={false}
            />
            <ArticleCard
              title="宫崎骏动画的艺术价值"
              movieTitle="千与千寻"
              genre="动画"
              creator="0x9999...1111"
              contributions={15}
              likes={67}
              isCompleted={true}
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">如何参与</h2>
            <p className="text-lg text-gray-600">
              简单三步，开始你的创作之旅
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">连接钱包</h3>
              <p className="text-gray-600">
                连接你的Web3钱包，开始参与平台的创作活动
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">选择文章</h3>
              <p className="text-gray-600">
                浏览现有文章或创建新的电影文章主题
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">开始创作</h3>
              <p className="text-gray-600">
                贡献你的内容，获得代币奖励和NFT证书
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