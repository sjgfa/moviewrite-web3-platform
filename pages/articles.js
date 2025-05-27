import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAccount, useContractRead, useContractReads } from 'wagmi';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';
import ArticleCard from '@/components/ArticleCard';
import CreateArticleModal from '@/components/CreateArticleModal';
import { CONTRACT_ADDRESSES, MOVIE_ARTICLE_ABI } from '@/lib/web3';

export default function Articles() {
  const { address, isConnected } = useAccount();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // 获取文章总数
  const { data: totalArticles } = useContractRead({
    address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
    abi: MOVIE_ARTICLE_ABI,
    functionName: 'getTotalArticles',
    watch: true,
  });

  // 获取所有文章数据
  useEffect(() => {
    const fetchArticles = async () => {
      if (!totalArticles || totalArticles.toString() === '0') {
        setArticles([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const articlePromises = [];
        
        for (let i = 1; i <= Number(totalArticles); i++) {
          articlePromises.push(
            fetch('/api/article/' + i).then(res => res.json())
          );
        }

        const articlesData = await Promise.all(articlePromises);
        setArticles(articlesData.filter(article => article && !article.error));
      } catch (error) {
        console.error('获取文章失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [totalArticles]);

  // 筛选文章
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.movieTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || article.genre === selectedGenre;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && !article.isCompleted) ||
                         (selectedStatus === 'completed' && article.isCompleted);
    
    return matchesSearch && matchesGenre && matchesStatus;
  });

  const genres = ['all', '科幻', '动作', '剧情', '喜剧', '恐怖', '动画', '纪录片'];
  const statuses = [
    { value: 'all', label: '全部状态' },
    { value: 'active', label: '进行中' },
    { value: 'completed', label: '已完成' }
  ];

  return (
    <Layout>
      <Head>
        <title>文章列表 - 电影文章共创平台</title>
        <meta name="description" content="浏览所有电影文章创作项目" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">文章列表</h1>
                <p className="mt-2 text-gray-600">
                  发现和参与电影文章创作项目
                </p>
              </div>
              
              {isConnected && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 md:mt-0 flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>创建新文章</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索文章标题或电影名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Genre Filter */}
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre}>
                      {genre === 'all' ? '全部类型' : genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article, index) => (
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">没有找到文章</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedGenre !== 'all' || selectedStatus !== 'all' 
                  ? '尝试调整筛选条件' 
                  : '还没有文章，成为第一个创建者吧！'
                }
              </p>
              {isConnected && !searchTerm && selectedGenre === 'all' && selectedStatus === 'all' && (
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
        </div>
      </div>

      {/* Create Article Modal */}
      <CreateArticleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </Layout>
  );
} 