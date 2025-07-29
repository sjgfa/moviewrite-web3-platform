import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import Head from 'next/head';
import Layout from '../components/Layout';
import SimpleEditor from '../components/SimpleEditor';
import CategorySelector from '../components/CategorySelector';
import toast from 'react-hot-toast';

export default function WritePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // 处理发布
  const handlePublish = async (articleData) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsPublishing(true);
    
    try {
      // 调用发布API
      const response = await fetch('/api/articles/individual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...articleData,
          categories: selectedCategories,
          authorAddress: address
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish article');
      }

      // 成功后跳转到文章页面
      toast.success('Article published successfully!');
      router.push(`/article/${data.article.id}`);
      
    } catch (error) {
      console.error('Publish error:', error);
      toast.error(error.message || 'Failed to publish article');
    } finally {
      setIsPublishing(false);
    }
  };

  // 如果用户未连接钱包
  if (!isConnected) {
    return (
      <Layout>
        <Head>
          <title>Write Article - MovieWrite</title>
        </Head>
        
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Your Wallet to Start Writing
            </h2>
            <p className="text-gray-600 mb-8">
              You need to connect your wallet to create and publish articles on MovieWrite.
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Connect Wallet
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Write Article - MovieWrite</title>
        <meta name="description" content="Create and publish your article on MovieWrite" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 页面头部 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                Write Your Article
              </h1>
              
              <button
                onClick={() => router.push('/profile')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="mt-2 text-gray-600">
              Share your thoughts with the world. Your article will be stored permanently on IPFS.
            </p>
          </div>

          {/* 分类选择器 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <CategorySelector
              selectedCategories={selectedCategories}
              onChange={setSelectedCategories}
              maxSelections={3}
            />
          </div>

          {/* 编辑器 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <SimpleEditor
              onPublish={handlePublish}
              isPublishing={isPublishing}
              autoSave={true}
            />
          </div>

          {/* 提示信息 */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  About IPFS Storage
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Your article will be stored on IPFS (InterPlanetary File System), a decentralized storage network. 
                    This ensures your content remains accessible and cannot be censored or deleted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}