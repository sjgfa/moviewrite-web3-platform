import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import Layout from '../components/Layout';
import IndividualArticleCard from '../components/IndividualArticleCard';
import toast from 'react-hot-toast';

const categories = [
  { id: 'all', name: 'All', slug: 'all' },
  { id: 1, name: 'Technology', slug: 'technology' },
  { id: 2, name: 'Blockchain', slug: 'blockchain' },
  { id: 3, name: 'Movies', slug: 'movies' },
  { id: 4, name: 'Entertainment', slug: 'entertainment' },
  { id: 5, name: 'Tutorial', slug: 'tutorial' },
  { id: 6, name: 'Opinion', slug: 'opinion' }
];

export default function DiscoverPage() {
  const { isConnected } = useAccount();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // recent, popular

  // 获取文章列表
  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, sortBy]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/articles/individual?limit=20');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      
      const data = await response.json();
      let filteredArticles = data.articles || [];
      
      // 按分类过滤
      if (selectedCategory !== 'all') {
        const category = categories.find(c => c.slug === selectedCategory);
        if (category) {
          filteredArticles = filteredArticles.filter(article => 
            article.categories && article.categories.includes(category.name)
          );
        }
      }
      
      // 排序
      if (sortBy === 'popular') {
        filteredArticles.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
      } else {
        filteredArticles.sort((a, b) => 
          new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)
        );
      }
      
      setArticles(filteredArticles);
      
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Discover Articles - MovieWrite</title>
        <meta name="description" content="Discover amazing articles on MovieWrite" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Discover Amazing Content
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Explore articles from creators around the world, stored permanently on IPFS
              </p>
              
              {!isConnected && (
                <div className="mt-8">
                  <Link href="/write">
                    <a className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Start Writing
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.slug
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="mt-4 flex items-center space-x-4">
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <IndividualArticleCard
                  key={article.id}
                  article={article}
                  showAuthor={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try selecting a different category or be the first to write in this category!
              </p>
              <Link href="/write">
                <a className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Write an Article
                </a>
              </Link>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {!loading && articles.length >= 20 && (
          <div className="text-center pb-12">
            <button className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Load More Articles
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}