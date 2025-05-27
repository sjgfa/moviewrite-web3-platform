import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAccount, useContractRead, useContractWrite } from 'wagmi';
import { motion } from 'framer-motion';
import { 
  CommandLineIcon,
  GiftIcon,
  DocumentTextIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';
import { CONTRACT_ADDRESSES, MOVIE_ARTICLE_ABI, REWARD_TOKEN_ABI } from '@/lib/web3';
import { toast } from 'react-hot-toast';

export default function AdminPanel() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [pendingContributions, setPendingContributions] = useState([]);
  const [articles, setArticles] = useState([]);
  const [rewardAmount, setRewardAmount] = useState('10');
  const [loading, setLoading] = useState(false);

  // 防止 hydration 错误
  useEffect(() => {
    setMounted(true);
  }, []);

  // 检查是否是管理员（合约部署者）
  const { data: contractOwner } = useContractRead({
    address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
    abi: MOVIE_ARTICLE_ABI,
    functionName: 'owner',
    enabled: mounted && isConnected,
  });

  // 获取文章总数
  const { data: totalArticles } = useContractRead({
    address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
    abi: MOVIE_ARTICLE_ABI,
    functionName: 'getTotalArticles',
    enabled: mounted && isConnected,
  });

  // 获取贡献总数
  const { data: totalContributions } = useContractRead({
    address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
    abi: MOVIE_ARTICLE_ABI,
    functionName: 'getTotalContributions',
    enabled: mounted && isConnected,
  });

  // 合约写入函数
  const { write: approveContribution } = useContractWrite({
    address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
    abi: MOVIE_ARTICLE_ABI,
    functionName: 'approveContribution',
    onSuccess: () => {
      toast.success('奖励分配成功！');
      fetchPendingContributions();
    },
    onError: (error) => {
      toast.error(`分配失败: ${error.message}`);
    }
  });

  const { write: completeArticle } = useContractWrite({
    address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
    abi: MOVIE_ARTICLE_ABI,
    functionName: 'completeArticle',
    onSuccess: () => {
      toast.success('文章已完成并铸造NFT！');
      fetchArticles();
    },
    onError: (error) => {
      toast.error(`完成文章失败: ${error.message}`);
    }
  });

  // 获取待审批的贡献
  const fetchPendingContributions = async () => {
    if (!totalContributions || !mounted) return;

    try {
      setLoading(true);
      const contributions = [];
      
      for (let i = 1; i <= Number(totalContributions); i++) {
        const response = await fetch(`/api/contribution/${i}`);
        const contribution = await response.json();
        
        if (contribution && !contribution.error && !contribution.isApproved) {
          contributions.push(contribution);
        }
      }
      
      setPendingContributions(contributions);
    } catch (error) {
      console.error('获取待审批贡献失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取所有文章
  const fetchArticles = async () => {
    if (!totalArticles || !mounted) return;

    try {
      const articlesData = [];
      
      for (let i = 1; i <= Number(totalArticles); i++) {
        const response = await fetch(`/api/article/${i}`);
        const article = await response.json();
        
        if (article && !article.error) {
          articlesData.push(article);
        }
      }
      
      setArticles(articlesData);
    } catch (error) {
      console.error('获取文章失败:', error);
    }
  };

  useEffect(() => {
    if (mounted && totalContributions) {
      fetchPendingContributions();
    }
  }, [totalContributions, mounted]);

  useEffect(() => {
    if (mounted && totalArticles) {
      fetchArticles();
    }
  }, [totalArticles, mounted]);

  // 处理奖励分配
  const handleApproveContribution = (contributionId, reward) => {
    if (!reward || reward <= 0) {
      toast.error('请输入有效的奖励金额');
      return;
    }

    const rewardInWei = (parseFloat(reward) * Math.pow(10, 18)).toString();
    approveContribution({
      args: [contributionId, rewardInWei]
    });
  };

  // 处理文章完成
  const handleCompleteArticle = (articleId) => {
    completeArticle({
      args: [articleId]
    });
  };

  // 如果还没有挂载，返回加载状态
  if (!mounted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // 检查是否是管理员
  const isAdmin = contractOwner && address && contractOwner.toLowerCase() === address.toLowerCase();

  if (!isConnected) {
    return (
      <Layout>
        <Head>
          <title>管理员面板 - MovieWrite</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <CommandLineIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">管理员面板</h2>
            <p className="text-gray-600 mb-4">请先连接钱包以访问管理功能</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <Head>
          <title>访问被拒绝 - MovieWrite</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <XCircleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">访问被拒绝</h2>
            <p className="text-gray-600 mb-4">只有管理员可以访问此页面</p>
            <p className="text-sm text-gray-500">当前账户: {address}</p>
            <p className="text-sm text-gray-500">管理员账户: {contractOwner}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>管理员面板 - MovieWrite</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 头部 */}
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <CommandLineIcon className="h-8 w-8 text-yellow-500" />
              <h1 className="text-3xl font-bold text-gray-900">管理员面板</h1>
            </div>
            <p className="mt-2 text-gray-600">管理文章、贡献和奖励分配</p>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">总文章数</p>
                  <p className="text-2xl font-bold text-gray-900">{totalArticles?.toString() || '0'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">总贡献数</p>
                  <p className="text-2xl font-bold text-gray-900">{totalContributions?.toString() || '0'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <GiftIcon className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">待审批贡献</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingContributions.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <StarIcon className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">已完成文章</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {articles.filter(article => article.isCompleted).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 待审批贡献 */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">待审批贡献</h2>
              <p className="text-gray-600">审核贡献并分配奖励</p>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">加载中...</p>
                </div>
              ) : pendingContributions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-600">所有贡献都已审批完成</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingContributions.map((contribution) => (
                    <motion.div
                      key={contribution.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              贡献 #{contribution.id}
                            </span>
                            <span className="text-sm text-gray-500">
                              文章 #{contribution.articleId}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            贡献者: {contribution.contributor}
                          </p>
                          
                          <div className="bg-gray-50 rounded p-3 mb-3">
                            <p className="text-sm text-gray-800">
                              {contribution.content.substring(0, 200)}
                              {contribution.content.length > 200 && '...'}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>👍 {contribution.likes} 点赞</span>
                            <span>📝 {contribution.content.length} 字符</span>
                            <span>⏰ {new Date(contribution.timestamp * 1000).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="ml-4 flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={rewardAmount}
                              onChange={(e) => setRewardAmount(e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="奖励"
                              min="0"
                              step="0.1"
                            />
                            <span className="text-sm text-gray-500">MWT</span>
                          </div>
                          
                          <button
                            onClick={() => handleApproveContribution(contribution.id, rewardAmount)}
                            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            ✅ 审批
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 文章管理 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">文章管理</h2>
              <p className="text-gray-600">管理文章状态和完成度</p>
            </div>

            <div className="p-6">
              {articles.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">暂无文章</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{article.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          article.isCompleted 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {article.isCompleted ? '已完成' : '进行中'}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1 mb-4">
                        <p>📽️ {article.movieTitle}</p>
                        <p>📚 {article.genre}</p>
                        <p>👤 创建者: {article.creator}</p>
                        <p>📝 贡献数: {article.totalContributions}</p>
                      </div>

                      {!article.isCompleted && Number(article.totalContributions) >= 2 && (
                        <button
                          onClick={() => handleCompleteArticle(article.id)}
                          className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          🏁 完成文章
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 