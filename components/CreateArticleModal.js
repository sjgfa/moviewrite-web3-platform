import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { CONTRACT_ADDRESSES, MOVIE_ARTICLE_ABI } from '@/lib/web3';
import toast from 'react-hot-toast';

export default function CreateArticleModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    movieTitle: '',
    genre: '',
    minContributionLength: 100,
    maxContributors: 10,
  });

  const genres = [
    '科幻', '动作', '动画', '剧情', '喜剧', '恐怖', '爱情', '悬疑', '战争', '历史'
  ];

  const { data, write, isLoading } = useContractWrite({
    address: CONTRACT_ADDRESSES.movieArticle,
    abi: MOVIE_ARTICLE_ABI,
    functionName: 'createArticle',
  });

  const { isLoading: isTransactionLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => {
      toast.success('文章创建成功！');
      onClose();
      setFormData({
        title: '',
        movieTitle: '',
        genre: '',
        minContributionLength: 100,
        maxContributors: 10,
      });
    },
    onError: (error) => {
      toast.error('创建失败：' + error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.movieTitle || !formData.genre) {
      toast.error('请填写所有必填字段');
      return;
    }

    write({
      args: [
        formData.title,
        formData.movieTitle,
        formData.genre,
        formData.minContributionLength,
        formData.maxContributors,
      ],
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'minContributionLength' || name === 'maxContributors' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    创建新文章
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      文章标题 *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="输入文章标题"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="movieTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      电影名称 *
                    </label>
                    <input
                      type="text"
                      id="movieTitle"
                      name="movieTitle"
                      value={formData.movieTitle}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="输入电影名称"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                      电影类型 *
                    </label>
                    <select
                      id="genre"
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">选择类型</option>
                      {genres.map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="minContributionLength" className="block text-sm font-medium text-gray-700 mb-1">
                        最小字数
                      </label>
                      <input
                        type="number"
                        id="minContributionLength"
                        name="minContributionLength"
                        value={formData.minContributionLength}
                        onChange={handleChange}
                        min="50"
                        max="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="maxContributors" className="block text-sm font-medium text-gray-700 mb-1">
                        最大贡献者
                      </label>
                      <input
                        type="number"
                        id="maxContributors"
                        name="maxContributors"
                        value={formData.maxContributors}
                        onChange={handleChange}
                        min="5"
                        max="50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || isTransactionLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading || isTransactionLoading ? '创建中...' : '创建文章'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 