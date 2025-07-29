import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import IndividualArticleCard from '../../components/IndividualArticleCard';
import toast from 'react-hot-toast';

export default function UserProfilePage() {
  const router = useRouter();
  const { username } = router.query;
  const { address } = useAccount();
  
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('articles');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Profile edit form state
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    twitterHandle: '',
    websiteUrl: ''
  });

  // 获取用户资料和文章
  useEffect(() => {
    if (!username) return;
    
    fetchUserData();
  }, [username]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // 获取用户资料
      const profileRes = await fetch(`/api/users/profile?username=${username}`);
      if (!profileRes.ok) {
        // 如果用户名不存在，尝试作为地址查询
        const addressRes = await fetch(`/api/users/profile?address=${username}`);
        if (!addressRes.ok) {
          throw new Error('User not found');
        }
        const addressData = await addressRes.json();
        setProfile(addressData.profile);
      } else {
        const profileData = await profileRes.json();
        setProfile(profileData.profile);
      }
      
      // 获取用户文章
      const userAddress = profile?.address || username;
      const articlesRes = await fetch(`/api/articles/individual?author=${userAddress}`);
      if (articlesRes.ok) {
        const articlesData = await articlesRes.json();
        setArticles(articlesData.articles);
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user profile');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // 处理关注/取消关注
  const handleFollow = async () => {
    if (!address) {
      toast.error('Please connect your wallet to follow users');
      return;
    }

    try {
      // TODO: 实现关注API
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Unfollowed' : 'Following!');
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  // 处理资料编辑
  const handleEditProfile = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          ...editForm
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setIsEditingProfile(false);
      toast.success('Profile updated successfully!');
      
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    }
  };

  // 检查是否是当前用户的主页
  const isOwnProfile = profile && address && profile.address === address;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
            <Link href="/">
              <a className="text-blue-600 hover:underline">Go back home</a>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{profile.displayName || profile.username || 'User'} - MovieWrite</title>
        <meta name="description" content={profile.bio || 'MovieWrite user profile'} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Profile Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex-shrink-0" />
                
                {/* Profile Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profile.displayName || profile.username || `${profile.address.slice(0, 6)}...${profile.address.slice(-4)}`}
                  </h1>
                  
                  {profile.username && (
                    <p className="text-gray-600 mt-1">@{profile.username}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>{profile.address.slice(0, 6)}...{profile.address.slice(-4)}</span>
                    {profile.twitterHandle && (
                      <a 
                        href={`https://twitter.com/${profile.twitterHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-blue-600"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        {profile.twitterHandle}
                      </a>
                    )}
                    {profile.websiteUrl && (
                      <a 
                        href={profile.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-blue-600"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        Website
                      </a>
                    )}
                  </div>
                  
                  {profile.bio && (
                    <p className="mt-4 text-gray-700 max-w-2xl">
                      {profile.bio}
                    </p>
                  )}
                  
                  {/* Stats */}
                  <div className="flex items-center space-x-6 mt-6">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{profile.stats?.articlesCount || 0}</span>
                      <span className="text-gray-600 ml-1">Articles</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{profile.stats?.followersCount || 0}</span>
                      <span className="text-gray-600 ml-1">Followers</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{profile.stats?.followingCount || 0}</span>
                      <span className="text-gray-600 ml-1">Following</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => {
                        setEditForm({
                          displayName: profile.displayName || '',
                          bio: profile.bio || '',
                          twitterHandle: profile.twitterHandle || '',
                          websiteUrl: profile.websiteUrl || ''
                        });
                        setIsEditingProfile(true);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Edit Profile
                    </button>
                    <Link href="/write">
                      <a className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Write Article
                      </a>
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isFollowing 
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('articles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'articles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Articles ({articles.length})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'about'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                About
              </button>
            </nav>
          </div>
        </div>
        
        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'articles' && (
            <div>
              {articles.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {articles.map((article) => (
                    <IndividualArticleCard
                      key={article.id}
                      article={article}
                      showAuthor={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No articles yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {isOwnProfile ? "Start writing your first article!" : "This user hasn't published any articles yet."}
                  </p>
                  {isOwnProfile && (
                    <Link href="/write">
                      <a className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Write Your First Article
                      </a>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'about' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
              
              <div className="space-y-4">
                {profile.bio && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Bio</h3>
                    <p className="text-gray-600">{profile.bio}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Wallet Address</h3>
                  <p className="font-mono text-sm text-gray-600">{profile.address}</p>
                </div>
                
                {profile.createdAt && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Member Since</h3>
                    <p className="text-gray-600">
                      {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Connect</h3>
                  <div className="flex space-x-4">
                    {profile.twitterHandle && (
                      <a 
                        href={`https://twitter.com/${profile.twitterHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Twitter
                      </a>
                    )}
                    {profile.websiteUrl && (
                      <a 
                        href={profile.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Edit Profile Modal */}
        {isEditingProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Profile</h2>
              
              <form onSubmit={handleEditProfile}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editForm.displayName}
                      onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your display name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Tell us about yourself"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Twitter Handle
                    </label>
                    <input
                      type="text"
                      value={editForm.twitterHandle}
                      onChange={(e) => setEditForm({ ...editForm, twitterHandle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="@username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={editForm.websiteUrl}
                      onChange={(e) => setEditForm({ ...editForm, websiteUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}