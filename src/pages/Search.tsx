import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiX, FiExternalLink, FiHeart, FiMessageSquare, FiShare2, FiFilter } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { BD_PORT } from '../const';
import { FaFire, FaRegClock, FaRegEye, FaMapMarkerAlt, FaHashtag } from 'react-icons/fa';

// Interface for post data
interface Post {
  postId: string;
  imageUrl: string;
  caption?: string;
  description?: string;
  hashtags?: string[];
  authorState?: string;
  createdAt?: string;
  likes?: number;
  comments?: number;
  views?: number;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

// Interface for API response
interface PostsResponse {
  success: boolean;
  message?: string;
  posts: Post[];
}

// Interface for PostCard props
interface PostCardProps {
  post: Post;
  index: number;
}

const Search: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [popularHashtags, setPopularHashtags] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const filters = [
    { id: 'all', label: 'All Results', icon: <FiSearch /> },
    { id: 'trending', label: 'Trending', icon: <FaFire /> },
    { id: 'recent', label: 'Recent', icon: <FaRegClock /> },
    { id: 'critical', label: 'Critical', icon: <FiFilter /> },
  ];

  // Extract initial search query from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
  }, [location.search]);

  useEffect(() => {
    const fetchPosts = async (): Promise<void> => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required. Please login.');
          setLoading(false);
          return;
        }

        const response = await axios.get<PostsResponse>(`${BD_PORT}/api/posts/all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.success && response.data.posts) {
          // Add mock data for demonstration
          const enhancedPosts = response.data.posts.map(post => ({
            ...post,
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 50),
            views: Math.floor(Math.random() * 1000),
            urgency: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as 'low' | 'medium' | 'high' | 'critical',
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            hashtags: post.hashtags || ['community', 'issue', 'anonymous']
          }));
          
          setPosts(enhancedPosts);
          setFilteredPosts(enhancedPosts);
          
          // Extract popular hashtags
          const allHashtags = enhancedPosts.flatMap(post => post.hashtags || []);
          const hashtagCounts = allHashtags.reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const popular = Object.entries(hashtagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([tag]) => tag);
            
          setPopularHashtags(popular);
          
          if (searchQuery) {
            filterPosts(searchQuery, enhancedPosts, 'all');
          }
        } else {
          setError('Unexpected response structure');
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching posts:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setError('Session expired. Please login again.');
        } else {
          setError(err.response?.data?.message || err.message || 'Failed to load posts');
        }
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts whenever searchQuery or activeFilter changes
  useEffect(() => {
    filterPosts(searchQuery, posts, activeFilter);
  }, [searchQuery, posts, activeFilter]);

  const filterPosts = (query: string, postsToFilter: Post[], filter: string): void => {
    let results = postsToFilter;

    // Apply search filter
    if (query) {
      const searchTerms = query.split(/\s+/)
        .map(term => term.replace('#', '').trim().toLowerCase())
        .filter(term => term.length > 0);

      if (searchTerms.length > 0) {
        results = results.filter(post => {
          const searchableText = [
            post.caption,
            post.description,
            ...(post.hashtags || [])
          ].join(' ').toLowerCase();

          return searchTerms.some(term => searchableText.includes(term));
        });
      }
    }

    // Apply category filter
    switch (filter) {
      case 'trending':
        results = results.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case 'recent':
        results = results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'critical':
        results = results.filter(post => post.urgency === 'critical');
        break;
      default:
        results = results;
    }

    setFilteredPosts(results);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const query = e.target.value;
    setSearchQuery(query);
    navigate(`?q=${encodeURIComponent(query)}`, { replace: true });
  };

  const clearSearch = (): void => {
    setSearchQuery('');
    navigate('', { replace: true });
  };

  const handleHashtagClick = (hashtag: string): void => {
    setSearchQuery(hashtag);
    navigate(`?q=${encodeURIComponent(hashtag)}`, { replace: true });
  };

  const handleLoginRedirect = (): void => {
    navigate('/login');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-amber-500 text-white';
      case 'low': return 'bg-brown-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  // PostCard component with typed props
  const PostCard: React.FC<PostCardProps> = ({ post, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative h-full"
    >
      <div className="h-full bg-white rounded-2xl shadow-lg border border-amber-100 hover:shadow-xl hover:border-amber-200 overflow-hidden transition-all duration-300">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.caption || 'Post'}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x300/FFEDD5/7C2D12?text=Image+Not+Found';
              e.currentTarget.className = 'w-full h-48 object-cover bg-amber-50';
            }}
          />
          
          {/* Urgency Badge */}
          {post.urgency && (
            <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(post.urgency)}`}>
              {post.urgency.toUpperCase()}
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-brown-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <div className="text-white">
              <p className="font-medium text-sm mb-1">Posted anonymously</p>
              <div className="flex items-center space-x-3 text-xs opacity-90">
                <span className="flex items-center">
                  <FiHeart className="mr-1" /> {post.likes}
                </span>
                <span className="flex items-center">
                  <FiMessageSquare className="mr-1" /> {post.comments}
                </span>
                <span className="flex items-center">
                  <FaRegEye className="mr-1" /> {post.views}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-brown-800 line-clamp-1 text-lg">
              {post.caption || 'Community Concern'}
            </h3>
            {post.urgency === 'critical' && <FaFire className="text-red-500" />}
          </div>
          
          <p className="text-brown-600 mb-4 line-clamp-2 text-sm leading-relaxed">
            {post.description || 'A community member has shared this concern for public awareness.'}
          </p>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.hashtags.slice(0, 3).map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => handleHashtagClick(tag)}
                  className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs hover:bg-amber-200 transition-colors"
                >
                  <FaHashtag className="mr-1" size={10} />
                  {tag.replace('#', '')}
                </button>
              ))}
              {post.hashtags.length > 3 && (
                <span className="text-brown-400 text-xs">+{post.hashtags.length - 3} more</span>
              )}
            </div>
          )}

          {/* Location and Time */}
          <div className="flex items-center justify-between text-sm text-brown-500 mb-4">
            <div className="flex items-center space-x-2">
              {post.authorState && post.authorState !== 'unknown' ? (
                <>
                  <FaMapMarkerAlt className="text-amber-600" />
                  <span className="truncate max-w-[100px]">{post.authorState}</span>
                </>
              ) : (
                <span className="text-brown-400">Location hidden</span>
              )}
            </div>
            {post.createdAt && (
              <span className="text-brown-400">{formatTimeAgo(post.createdAt)}</span>
            )}
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center justify-between border-t border-amber-100 pt-3">
            <div className="flex items-center space-x-4 text-brown-500">
              <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                <FiHeart />
                <span className="text-xs">{post.likes}</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-amber-600 transition-colors">
                <FiMessageSquare />
                <span className="text-xs">{post.comments}</span>
              </button>
              <button className="flex items-center space-x-1 hover-text-brown-600 transition-colors">
                <FiShare2 />
              </button>
            </div>
            
            <Link
              to={`/posts/${post.postId}`}
              className="flex items-center text-amber-600 hover:text-amber-700 transition-colors font-medium text-sm"
            >
              View Details <FiExternalLink className="ml-1" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-brown-50 flex justify-center items-center overflow-hidden pt-20"
      >
        <div className="flex flex-col items-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-amber-200 shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500 mb-4"></div>
          <p className="text-brown-700 font-medium">Searching community posts...</p>
          <p className="text-brown-500 text-sm mt-2">Loading voices from around the world</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-brown-50 flex justify-center items-center overflow-hidden pt-20"
      >
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-amber-200 shadow-lg max-w-md mx-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something Went Wrong</h2>
          <p className="text-brown-700 mb-6">{error}</p>
          <div className="space-y-3">
            {error.includes('login') || error.includes('Authentication') || error.includes('Session') ? (
              <button
                onClick={handleLoginRedirect}
                className="w-full py-3 font-bold text-white rounded-xl transition-all bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 shadow-lg"
              >
                Go to Login
              </button>
            ) : null}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 font-bold text-brown-700 rounded-xl transition-all border border-amber-300 hover:border-amber-400 bg-amber-50 hover:bg-amber-100"
            >
              Try Again
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
      className="relative min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-brown-50 py-8 px-4 md:px-8 xl:px-16 overflow-hidden pt-20"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-brown-800 mb-4"
          >
            Search Community Voices
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-brown-600 text-lg max-w-2xl mx-auto"
          >
            Discover anonymous civic concerns by searching hashtags, locations, or topics
          </motion.p>
        </header>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 shadow-lg p-6 mb-6"
        >
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="w-5 h-5 text-brown-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by hashtags, locations, or topics (e.g., #community #safety potholes)"
              className="w-full pl-10 pr-12 py-4 rounded-xl border border-amber-200 bg-white text-brown-800 placeholder-brown-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all text-lg"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-brown-400 hover:text-red-500 transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-4"
            >
              <p className="text-brown-700">
                Found <span className="font-bold text-amber-600">{filteredPosts.length}</span> results for "{searchQuery}"
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Popular Hashtags */}
        {popularHashtags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 shadow-lg p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-brown-800 mb-3 flex items-center">
              <FaHashtag className="mr-2 text-amber-600" />
              Popular Hashtags
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularHashtags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => handleHashtagClick(tag)}
                  className="px-3 py-2 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all border border-amber-200 hover:border-amber-300 text-sm font-medium"
                >
                  #{tag.replace('#', '')}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-2 mb-6 justify-center"
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-lg'
                  : 'text-brown-600 bg-amber-100 hover:bg-amber-200 border border-amber-200'
              }`}
            >
              {filter.icon}
              {filter.label}
            </button>
          ))}
        </motion.div>

        {/* Posts Grid */}
        <AnimatePresence mode="wait">
          {!Array.isArray(filteredPosts) ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <p className="text-red-600 text-lg">Posts data is not available</p>
            </motion.div>
          ) : filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="inline-block p-8 bg-white/80 border border-amber-200 rounded-2xl">
                {searchQuery ? (
                  <>
                    <p className="text-brown-700 text-lg mb-2">No posts found matching your search</p>
                    <p className="text-brown-500">Try different keywords or browse popular hashtags</p>
                  </>
                ) : (
                  <>
                    <p className="text-brown-700 text-lg mb-2">No community posts found yet</p>
                    <p className="text-brown-500">Be the first to share a community concern!</p>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeFilter + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredPosts.map((post, index) => (
                <PostCard key={post.postId} post={post} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Search;