import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  UserGroupIcon, 
  ClockIcon,
  CheckCircleIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { formatAddress, formatDate } from '@/lib/web3';

export default function ArticleCard({
  id,
  title,
  movieTitle,
  genre,
  creator,
  totalContributions,
  maxContributors,
  isCompleted,
  createdAt,
  className = ''
}) {
  const genreColors = {
    '科幻': 'bg-blue-100 text-blue-800',
    '动作': 'bg-red-100 text-red-800',
    '动画': 'bg-purple-100 text-purple-800',
    '剧情': 'bg-green-100 text-green-800',
    '喜剧': 'bg-yellow-100 text-yellow-800',
    '恐怖': 'bg-gray-100 text-gray-800',
    '爱情': 'bg-pink-100 text-pink-800',
    '悬疑': 'bg-indigo-100 text-indigo-800',
    '战争': 'bg-orange-100 text-orange-800',
    '历史': 'bg-teal-100 text-teal-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer ${className}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <FilmIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{movieTitle}</span>
              {isCompleted && (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {title}
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${genreColors[genre] || 'bg-gray-100 text-gray-800'}`}>
            {genre}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <UserGroupIcon className="h-4 w-4" />
            <span>{totalContributions || 0} 贡献</span>
          </div>
          {createdAt && (
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4" />
              <span>{formatDate(createdAt)}</span>
            </div>
          )}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isCompleted 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {isCompleted ? '已完成' : '进行中'}
          </div>
        </div>

        {/* Creator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {creator ? formatAddress(creator).slice(0, 2) : 'UN'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">创建者</p>
              <p className="text-sm font-medium text-gray-900">
                {formatAddress(creator)}
              </p>
            </div>
          </div>

          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            {isCompleted ? '查看' : '参与'}
          </div>
        </div>

        {/* Progress Bar */}
        {!isCompleted && maxContributors && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>进度</span>
              <span>{totalContributions || 0}/{maxContributors}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(((totalContributions || 0) / maxContributors) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
} 