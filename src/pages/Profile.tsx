import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrowserProvider } from 'ethers';
import axios from 'axios';
import { motion } from 'framer-motion';
import dp from '../assets/dp.png';
import { BD_PORT } from '../const';

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
}

// Interface for post data
interface Post {
  postId: string;
  imageUrl: string;
  caption?: string;
  likeCount?: number;
  dislikeCount?: number;
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
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndWallet = async (): Promise<void> => {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
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
      setTotalLikes(likes);
      setTotalDislikes(dislikes);
    }
  }, [posts]);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      setPostsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Making request with token:', token.substring(0, 20) + '...');
      
      const response = await axios.get<DashboardResponse>(`${BD_PORT}/auth/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

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

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-10 left-0 w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-600/20 via-sky-500/15 to-blue-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-700/15 via-sky-600/15 to-blue-500/10 blur-3xl" />
        </div>
        <div className="flex flex-col items-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-cyan-600/30">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-cyan-500 mb-4"></div>
          <p className="text-cyan-200 font-medium">Loading profile data...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-10 left-0 w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-600/20 via-sky-500/15 to-blue-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-700/15 via-sky-600/15 to-blue-500/10 blur-3xl" />
        </div>
        <div className="max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-cyan-600/30 text-center">
          <div className="text-red-300 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-cyan-100 mb-2">Error Loading Profile</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            {error.includes('login') || error.includes('Session expired') ? (
              <button
                onClick={handleLogin}
                className="w-full py-3 font-bold text-cyan-100 rounded-xl transition-all border border-cyan-600/25 hover:border-sky-400/60 bg-slate-900/20 hover:bg-slate-900/30"
              >
                Go to Login
              </button>
            ) : null}
            {!walletAddress && !error.includes('login') && (
              <button
                onClick={handleConnectWallet}
                className="w-full py-3 font-bold text-cyan-100 rounded-xl transition-all border border-cyan-600/25 hover:border-sky-400/60 bg-slate-900/20 hover:bg-slate-900/30"
              >
                Connect Wallet
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 font-bold text-cyan-100 rounded-xl transition-all border border-cyan-600/25 hover:border-sky-400/60 bg-slate-900/20 hover:bg-slate-900/30"
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
      className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-19 overflow-hidden py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 left-0 w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-600/20 via-sky-500/15 to-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-700/15 via-sky-600/15 to-blue-500/10 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-cyan-600/30 hover:border-sky-400/60 transition-all duration-300 hover:shadow-[0_0_25px_-8px_rgba(56,189,248,0.35)]"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
            <img
              src={profilePicture}
              alt="Profile"
              className="w-24 h-24 md:w-32 md:h-32 object-cover object-center aspect-square rounded-full border-2 border-cyan-600/30 shadow-[0_0_15px_rgba(56,189,248,0.9)]"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = dp;
              }}
            />
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-4">
                <h2 className="text-xl font-extrabold text-cyan-100 flex items-center">
                  {userData?.username || 'User ID'}
                  <span className="ml-2 flex items-center border-cyan-500 border-2 p-2 rounded-full">
                    <span className="text-cyan-300 text-xs font-semibold">
                      {userData?.userLevel === 'super_active' ? 'Verified' : 
                       userData?.userLevel === 'active' ? 'Verified' : 'Verified'}
                    </span>
                    <svg className="w-4 h-4 ml-1 text-cyan-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </span>
                </h2>
              </div>
              <div className="flex space-x-8 mb-2">
                <div className="text-center">
                  <span className="font-bold text-cyan-100">{posts?.length || 0}</span>
                  <span className="text-gray-300 block text-sm">Posts</span>
                </div>
                <div className="text-center">
                  <span className="font-bold text-cyan-100">{totalLikes}</span>
                  <span className="text-gray-300 block text-sm">Likes</span>
                </div>
                <div className="text-center">
                  <span className="font-bold text-cyan-100">{totalDislikes}</span>
                  <span className="text-gray-300 block text-sm">Dislikes</span>
                </div>
              </div>
              {userData?.walletAddress && (
                <div className="mb-4">
                  <span className="text-gray-300 text-xs">Wallet:</span>
                  <span className="ml-2 text-cyan-100 text-xs break-all">{userData.walletAddress}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-cyan-100 mb-4">
                <div>
                  <span className="text-gray-300 text-sm">State: </span>
                  <span className="font-medium capitalize">{userData?.state || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-gray-300 text-sm">Member since: </span>
                  <span className="font-medium">
                    {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-300 text-sm">Last login: </span>
                  <span className="font-medium">
                    {userData?.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'Never'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-300 text-sm">KYC Status: </span>
                  <span className="font-medium">
                    {userData?.kycHash ? 'Verified on-Chain' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <hr className="border-t border-cyan-600/30 my-4 max-w-4xl mx-auto" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {postsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-cyan-500"></div>
          </div>
        ) : postsError ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-cyan-600/30 hover:border-sky-400/60 transition-all duration-300 hover:shadow-[0_0_25px_-8px_rgba(56,189,248,0.35)]"
          >
            <div className="text-red-300 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-cyan-100 mb-2">Error Loading Posts</h3>
            <p className="text-gray-300 mb-4">{postsError}</p>
            <button
              onClick={fetchDashboardData}
              className="w-full py-3 font-bold text-cyan-100 rounded-xl transition-all border border-cyan-600/25 hover:border-sky-400/60 bg-slate-900/20 hover:bg-slate-900/30"
            >
              Retry
            </button>
          </motion.div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-cyan-600/30 hover:border-sky-400/60 transition-all duration-300 hover:shadow-[0_0_25px_-8px_rgba(56,189,248,0.35)]"
          >
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(56,189,248,0.9)]">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-cyan-100 mb-2">No Posts Yet</h3>
            <p className="text-gray-300">When you share photos and videos, they'll appear here.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {posts.map((post, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                key={post.postId}
                className="group relative block overflow-hidden rounded-xl border border-cyan-600/30 hover:border-sky-400/60 transition-all duration-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.35)]"
              >
                <Link to={`/posts/${post.postId}`}>
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                      e.currentTarget.className = 'w-full h-full object-cover bg-slate-900';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                    <div className="text-cyan-100 text-sm truncate w-full">
                      {post.caption || 'Untitled'}
                    </div>
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <span className="text-cyan-100 text-xs bg-slate-900/50 border border-green-500 px-2 py-1 rounded flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/>
                        </svg>
                        {post.likeCount || 0}
                      </span>
                      <span className="text-cyan-100 text-xs bg-slate-900/50 border border-red-500 px-2 py-1 rounded flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                        </svg>
                        {post.dislikeCount || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfilePage;