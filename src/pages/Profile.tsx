import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrowserProvider } from 'ethers';
import axios from 'axios';
import { motion } from 'framer-motion';
import dp from '../assets/dp.png';
import { BD_PORT } from '../const';
import { FiEdit, FiSettings, FiShare, FiCalendar, FiMapPin, FiCheckCircle, FiTrendingUp, FiImage } from 'react-icons/fi';
import { FaEthereum, FaRegHeart, FaRegComment, FaFire, FaSeedling } from 'react-icons/fa';

// Interface for user data
interface UserInfo {
  username?: string;
  profilePicture?: string;
  walletAddress?: string;
  state?: string;
  createdAt?: string;
  lastLogin?: string;
  kycHash?: string;
  userLevel?: 'super_active' | 'active' | 'inactive';
  bio?: string;
}

// Interface for post data
interface Post {
  postId: string;
  imageUrl: string;
  caption?: string;
  likeCount?: number;
  dislikeCount?: number;
  commentCount?: number;
  createdAt?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

// Interface for dashboard API response
interface DashboardResponse {
  success: boolean;
  message?: string;
  dashboard: {
    userInfo: UserInfo;
    posts: Post[];
  };
}

// Interface for window.ethereum (MetaMask)
interface EthereumWindow extends Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
  };
}

// Extend the global Window interface
declare const window: EthereumWindow;

const ProfilePage: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [userData, setUserData] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [totalLikes, setTotalLikes] = useState<number>(0);
  const [totalDislikes, setTotalDislikes] = useState<number>(0);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'posts' | 'stats' | 'activity'>('posts');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndWallet = async (): Promise<void> => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        setError('Please login to view your profile');
        return;
      }

      if (window.ethereum) {
        try {
          const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            await fetchDashboardData();
          } else {
            setIsLoading(false);
            setError('No wallet connected');
          }
        } catch (err: any) {
          console.error("Error fetching wallet address:", err);
          setIsLoading(false);
          setError('Failed to connect wallet');
        }
      } else {
        setIsLoading(false);
        setError('MetaMask is not installed');
      }
    };

    checkAuthAndWallet();
  }, []);

  useEffect(() => {
    if (posts && posts.length > 0) {
      const likes = posts.reduce((sum, post) => sum + (post.likeCount || 0), 0);
      const dislikes = posts.reduce((sum, post) => sum + (post.dislikeCount || 0), 0);
      const comments = posts.reduce((sum, post) => sum + (post.commentCount || 0), 0);
      setTotalLikes(likes);
      setTotalDislikes(dislikes);
      setTotalComments(comments);
    }
  }, [posts]);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      setPostsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get<DashboardResponse>(`${BD_PORT}/auth/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const dashboardData = response.data.dashboard;
        setUserData(dashboardData.userInfo);
        setPosts(dashboardData.posts || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard data');
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setError('Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Please check your permissions.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load profile data');
      }
      setPostsError(err.response?.data?.message || err.message || 'Failed to load posts');
    } finally {
      setIsLoading(false);
      setPostsLoading(false);
    }
  };

  const profilePicture = userData?.profilePicture ? userData.profilePicture : dp;

  const handleConnectWallet = async (): Promise<void> => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }
      
      const provider = new BrowserProvider(window.ethereum);
      const accounts: string[] = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);
      await fetchDashboardData();
    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const handleLogin = (): void => {
    navigate('/login');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-brown-500';
      default: return 'bg-gray-500';
    }
  };

  const getUserLevelBadge = (level: string) => {
    switch (level) {
      case 'super_active':
        return { color: 'from-red-500 to-amber-500', text: 'Super Active', icon: <FaFire /> };
      case 'active':
        return { color: 'from-amber-500 to-yellow-500', text: 'Active', icon: <FiTrendingUp /> };
      default:
        return { color: 'from-brown-500 to-amber-500', text: 'Member', icon: <FaSeedling /> };
    }
  };

  const levelBadge = userData?.userLevel ? getUserLevelBadge(userData.userLevel) : getUserLevelBadge('inactive');

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-brown-50 flex items-center justify-center overflow-hidden pt-20"
      >
        <div className="flex flex-col items-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-amber-200 shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500 mb-4"></div>
          <p className="text-brown-700 font-medium">Loading your profile...</p>
          <p className="text-brown-500 text-sm mt-2">Getting your community data</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-brown-50 flex items-center justify-center overflow-hidden pt-20"
      >
        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-amber-200 shadow-lg text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-brown-800 mb-2">Profile Access Error</h3>
          <p className="text-brown-600 mb-6">{error}</p>
          <div className="space-y-3">
            {error.includes('login') || error.includes('Session expired') ? (
              <button
                onClick={handleLogin}
                className="w-full py-3 font-bold text-white rounded-xl transition-all bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 shadow-lg"
              >
                Go to Login
              </button>
            ) : null}
            {!walletAddress && !error.includes('login') && (
              <button
                onClick={handleConnectWallet}
                className="w-full py-3 font-bold text-white rounded-xl transition-all bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 shadow-lg"
              >
                Connect Wallet
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 font-bold text-brown-700 rounded-xl transition-all border border-amber-300 hover:border-amber-400 bg-amber-50 hover:bg-amber-100"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-brown-50 pt-20 overflow-hidden py-8 px-4 sm:px-6 lg:px-8"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 shadow-lg p-8 mb-6"
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Profile Picture */}
            <div className="relative">
              <img
                src={profilePicture}
                alt="Profile"
                className="w-32 h-32 object-cover rounded-2xl border-4 border-amber-200 shadow-lg"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = dp;
                }}
              />
              <div className="absolute -bottom-2 -right-2">
                <div className={`bg-gradient-to-r ${levelBadge.color} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}>
                  {levelBadge.icon}
                  {levelBadge.text}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-brown-800 mb-2">
                    {userData?.username || 'Anonymous User'}
                  </h1>
                  {userData?.bio && (
                    <p className="text-brown-600 max-w-2xl">{userData.bio}</p>
                  )}
                </div>
                <div className="flex space-x-3 mt-4 lg:mt-0">
                  <button className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl border border-amber-200 hover:bg-amber-200 transition-colors">
                    <FiEdit size={16} />
                    Edit
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white text-brown-700 rounded-xl border border-amber-200 hover:bg-amber-50 transition-colors">
                    <FiSettings size={16} />
                    Settings
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="text-2xl font-bold text-brown-800">{posts?.length || 0}</div>
                  <div className="text-brown-600 text-sm">Posts</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-xl border border-red-200">
                  <div className="text-2xl font-bold text-brown-800">{totalLikes}</div>
                  <div className="text-brown-600 text-sm">Likes</div>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="text-2xl font-bold text-brown-800">{totalComments}</div>
                  <div className="text-brown-600 text-sm">Comments</div>
                </div>
                <div className="text-center p-3 bg-brown-50 rounded-xl border border-brown-200">
                  <div className="text-2xl font-bold text-brown-800">{totalDislikes}</div>
                  <div className="text-brown-600 text-sm">Engagement</div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-brown-600">
                  <FaEthereum className="text-amber-600" />
                  <span className="font-medium">Wallet:</span>
                  <span className="truncate">{userData?.walletAddress?.substring(0, 12)}...</span>
                </div>
                <div className="flex items-center gap-2 text-brown-600">
                  <FiMapPin className="text-amber-600" />
                  <span className="font-medium">Location:</span>
                  <span>{userData?.state || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-brown-600">
                  <FiCalendar className="text-amber-600" />
                  <span className="font-medium">Member since:</span>
                  <span>{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-brown-600">
                  <FiCheckCircle className="text-amber-600" />
                  <span className="font-medium">KYC Status:</span>
                  <span className={userData?.kycHash ? 'text-green-600 font-semibold' : 'text-red-600'}>
                    {userData?.kycHash ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 shadow-lg p-6 mb-6">
          <div className="flex space-x-4 border-b border-amber-200 pb-4">
            {[
              { id: 'posts' as const, label: 'My Posts', icon: <FiImage /> },
              { id: 'stats' as const, label: 'Statistics', icon: <FiTrendingUp /> },
              { id: 'activity' as const, label: 'Activity', icon: <FaFire /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-lg'
                    : 'text-brown-600 hover:bg-amber-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'posts' && (
              <div>
                {postsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-500"></div>
                  </div>
                ) : postsError ? (
                  <div className="text-center py-12">
                    <div className="text-red-500 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-brown-800 mb-2">Error Loading Posts</h3>
                    <p className="text-brown-600 mb-4">{postsError}</p>
                    <button
                      onClick={fetchDashboardData}
                      className="px-6 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FiImage className="w-10 h-10 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-brown-800 mb-2">No Posts Yet</h3>
                    <p className="text-brown-600 mb-4">Share your first community concern to get started!</p>
                    <Link
                      to="/create-post"
                      className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-xl hover:from-amber-600 hover:to-red-600 transition-all shadow-lg"
                    >
                      <FiEdit size={16} />
                      Create Your First Post
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post, index) => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        key={post.postId}
                        className="group relative bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-lg hover:shadow-xl transition-all"
                      >
                        <Link to={`/posts/${post.postId}`}>
                          <div className="relative">
                            <img
                              src={post.imageUrl}
                              alt="Post"
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                e.currentTarget.src = 'https://via.placeholder.com/400x300/FFEDD5/7C2D12?text=Image+Not+Found';
                                e.currentTarget.className = 'w-full h-48 object-cover bg-amber-50';
                              }}
                            />
                            {post.urgency && (
                              <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold text-white ${getUrgencyColor(post.urgency)}`}>
                                {post.urgency.toUpperCase()}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-brown-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                              <div className="text-white">
                                <p className="font-medium text-sm line-clamp-2">{post.caption || 'Community Concern'}</p>
                                <div className="flex items-center space-x-3 text-xs opacity-90 mt-2">
                                  <span className="flex items-center">
                                    <FaRegHeart className="mr-1" /> {post.likeCount || 0}
                                  </span>
                                  <span className="flex items-center">
                                    <FaRegComment className="mr-1" /> {post.commentCount || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FiTrendingUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-brown-800 mb-4">Community Impact Analytics</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="text-2xl font-bold text-amber-600">{posts.length}</div>
                    <div className="text-brown-600 text-sm">Posts Shared</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="text-2xl font-bold text-red-600">{totalLikes}</div>
                    <div className="text-brown-600 text-sm">Total Likes</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{totalComments}</div>
                    <div className="text-brown-600 text-sm">Comments</div>
                  </div>
                  <div className="p-4 bg-brown-50 rounded-xl border border-brown-200">
                    <div className="text-2xl font-bold text-brown-600">{(totalLikes + totalComments) / Math.max(posts.length, 1)}</div>
                    <div className="text-brown-600 text-sm">Avg. Engagement</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaFire className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-brown-800 mb-2">Recent Activity</h3>
                <p className="text-brown-600">Your community engagement history will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;