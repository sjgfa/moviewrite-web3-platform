import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  PlusIcon,
  HeartIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  TrophyIcon,
  PencilIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Layout from '@/components/Layout';
import { CONTRACT_ADDRESSES, MOVIE_ARTICLE_ABI, formatAddress, formatDateTime } from '@/lib/web3';

export default function ArticleDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { address, isConnected } = useAccount();
  
  const [article, setArticle] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newContribution, setNewContribution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 防止 hydration 错误
  useEffect(() => {
    setMounted(true);
  }, []);

  // 获取文章信息
  const { data: articleData, refetch: refetchArticle } = useContractRead({
    address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
    abi: MOVIE_ARTICLE_ABI,
    functionName: 'articles',
    args: [id],
    enabled: !!id && mounted,
    watch: true,
  });

  // 获取文章贡献列表
  const { data: contributionIds, refetch: refetchContributions } = useContractRead({
    address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
    abi: MOVIE_ARTICLE_ABI,
    functionName: 'getArticleContributions',
    args: [id],
    enabled: !!id && mounted,
    watch: true,
  });

  // 检查用户是否已贡献
  const { data: hasContributed } = useContractRead({
    address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
    abi: MOVIE_ARTICLE_ABI,
    functionName: 'hasContributed',
    args: [id, address],
    enabled: !!id && !!address && mounted,
    watch: true,
  });

  // 准备添加贡献的交易
  const { config: addContributionConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESSES.MOVIE_ARTICLE,
    abi: MOVIE_ARTICLE_ABI,
    functionName: 'addContribution',
    args: [id, newContribution],
    enabled: !!id && !!newContribution && newContribution.length >= (article?.minContributionLength || 50),
  });

  const { write: addContribution } = useContractWrite({
    ...addContributionConfig,
    onSuccess: () => {
      toast.success('贡献提交成功！');
      setNewContribution('');
      setIsSubmitting(false);
      refetchArticle();
      refetchContributions();
    },
    onError: (error) => {
      toast.error('提交失败: ' + error.message);
      setIsSubmitting(false);
    },
  });

  // 获取文章和贡献数据
  useEffect(() => {
    if (!mounted) return; // 防止 SSR 时执行
    
    if (articleData) {
      setArticle({
        id: Number(articleData[0]),
        title: articleData[1],
        movieTitle: articleData[2],
        genre: articleData[3],
        creator: articleData[4],
        createdAt: Number(articleData[5]),
        totalContributions: Number(articleData[6]),
        totalRewards: Number(articleData[7]),
        isCompleted: articleData[8],
        minContributionLength: Number(articleData[9]),
        maxContributors: Number(articleData[10]),
      });
    }
  }, [articleData, mounted]);

  // 获取贡献详情
  useEffect(() => {
    if (!mounted) return; // 防止 SSR 时执行
    
    const fetchContributions = async () => {
      if (!contributionIds || contributionIds.length === 0) {
        setContributions([]);
        setLoading(false);
        return;
      }

      try {
        const contributionPromises = contributionIds.map(async (contributionId) => {
          const response = await fetch(`/api/contribution/${contributionId}`);
          return response.json();
        });

        const contributionsData = await Promise.all(contributionPromises);
        setContributions(contributionsData.filter(c => c && !c.error));
      } catch (error) {
        console.error('获取贡献失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [contributionIds, mounted]);

  const handleSubmitContribution = async () => {
    if (!newContribution.trim()) {
      toast.error('请输入贡献内容');
      return;
    }

    if (newContribution.length < (article?.minContributionLength || 50)) {
      toast.error(`贡献内容至少需要 ${article?.minContributionLength || 50} 个字符`);
      return;
    }

    if (hasContributed) {
      toast.error('您已经为这篇文章贡献过了');
      return;
    }

    setIsSubmitting(true);
    addContribution?.();
  };

  if (!mounted || !id) {
    return (
      <Layout>
        <Head>
          <title>文章详情 - 电影文章共创平台</title>
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

  return (
    <Layout>
      <Head>
        <title>{article?.title || '文章详情'} - 电影文章共创平台</title>
        <meta name="description" content={`关于${article?.movieTitle}的协作文章`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4 mb-6">
              <Link href="/articles">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  <span>返回文章列表</span>
                </motion.button>
              </Link>
            </div>

            {article && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <FilmIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{article.title}</h1>
                    <p className="text-lg text-gray-600">电影：{article.movieTitle}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <UserIcon className="h-4 w-4" />
                    <span>创建者：{formatAddress(article.creator)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{formatDateTime(article.createdAt)}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    article.isCompleted 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {article.isCompleted ? '已完成' : '进行中'}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                    {article.genre}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <PencilIcon className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">贡献数量</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {article.totalContributions}/{article.maxContributors}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <TrophyIcon className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">总奖励</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {article.totalRewards} MWT
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">最小字数</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
                      {article.minContributionLength}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Add Contribution */}
          {isConnected && !article?.isCompleted && !hasContributed && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">添加您的贡献</h3>
              <textarea
                value={newContribution}
                onChange={(e) => setNewContribution(e.target.value)}
                placeholder={`请输入您的贡献内容（至少 ${article?.minContributionLength || 50} 个字符）...`}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-500">
                  {newContribution.length}/{article?.minContributionLength || 50} 字符
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmitContribution}
                  disabled={isSubmitting || newContribution.length < (article?.minContributionLength || 50)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>{isSubmitting ? '提交中...' : '提交贡献'}</span>
                </motion.button>
              </div>
            </div>
          )}

          {/* Contributions List */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              文章贡献 ({contributions.length})
            </h3>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : contributions.length > 0 ? (
              <div className="space-y-6">
                {contributions.map((contribution, index) => (
                  <motion.div
                    key={contribution.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {formatAddress(contribution.contributor).slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatAddress(contribution.contributor)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(contribution.timestamp)}
                          </p>
                        </div>
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
                        {contribution.content}
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
                  成为第一个为这篇文章贡献内容的人吧！
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 