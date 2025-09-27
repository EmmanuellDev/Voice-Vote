import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiX, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { BD_PORT } from '../const';

// Interface for post data
interface Post {
  postId: string;
  imageUrl: string;
  caption?: string;
  description?: string;
  hashtags?: string[];
  authorState?: string;
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
  const location = useLocation();
  const navigate = useNavigate();

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
          setPosts(response.data.posts);
          setFilteredPosts(response.data.posts);
          
          if (searchQuery) {
            filterPostsByHashtags(searchQuery, response.data.posts);
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

  // Filter posts whenever searchQuery changes
  useEffect(() => {
    filterPostsByHashtags(searchQuery, posts);
  }, [searchQuery, posts]);

  const filterPostsByHashtags = (query: string, postsToFilter: Post[]): void => {
    if (!query) {
      setFilteredPosts(postsToFilter);
      return;
    }

    const searchTerms = query.split(/\s+/)
      .map(term => term.replace('#', '').trim().toLowerCase())
      .filter(term => term.length > 0);

    if (searchTerms.length === 0) {
      setFilteredPosts(postsToFilter);
      return;
    }

    const normalizedQuery = query.replace('#', '').trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      setFilteredPosts(postsToFilter);
      return;
    }

    const results = postsToFilter.filter(post => {
      return post.hashtags?.some(tag => {
        const normalizedTag = tag.startsWith('#') 
          ? tag.substring(1).toLowerCase() 
          : tag.toLowerCase();
        return normalizedTag.startsWith(normalizedQuery);
      });
    });

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

  const handleLoginRedirect = (): void => {
    navigate('/login');
  };

  // PostCard component with typed props
  const PostCard: React.FC<PostCardProps> = ({ post, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative h-full"
    >
      <div className="h-full bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-sm rounded-xl border border-cyan-600/30 hover:border-sky-400/60 overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_-8px_rgba(56,189,248,0.35)]">
        <div className="relative overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.caption || 'Post'}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
              e.currentTarget.className = 'w-full h-48 object-cover bg-slate-800';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <div className="text-white">
              <p className="font-medium text-sm mb-1">Posted by Anonymous</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-cyan-100 mb-2 line-clamp-1">
            {post.caption || 'Untitled Post'}
          </h3>
          <p className="text-sm text-gray-300 mb-4 line-clamp-2">
            {post.description || 'Discover this anonymous post shared on the platform.'}
          </p>

          <div className="flex items-center justify-between text-sm text-cyan-300">
            <div className="flex items-start space-x-3 text-xs text-cyan-300">
              {post.authorState && post.authorState !== 'unknown' ? (
                <>
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="truncate max-w-[80px]">{post.authorState}</span>
                </>
              ) : (
                <span className="text-cyan-400/70">Unknown Location</span>
              )}
            </div>
            <Link
              to={`/posts/${post.postId}`}
              className="flex items-center text-sky-400 hover:text-sky-300 transition-colors"
            >
              View <FiExternalLink className="ml-1" size={14} />
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
        className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center overflow-hidden pt-20"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-10 left-0 w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-600/20 via-sky-500/15 to-blue-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-700/15 via-sky-600/15 to-blue-500/10 blur-3xl" />
        </div>
        
        <div className="flex flex-col items-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-cyan-600/30">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500 mb-4"></div>
          <p className="text-cyan-200 font-medium">Loading anonymous images...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center overflow-hidden pt-20"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-10 left-0 w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-600/20 via-sky-500/15 to-blue-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-700/15 via-sky-600/15 to-blue-500/10 blur-3xl" />
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-cyan-600/30 max-w-md mx-4">
          <h2 className="text-2xl font-bold text-red-300 mb-4">Something Went Wrong</h2>
          <p className="text-cyan-200 mb-6">{error}</p>
          <div className="space-y-3">
            {error.includes('login') || error.includes('Authentication') || error.includes('Session') ? (
              <button
                onClick={handleLoginRedirect}
                className="w-full py-3 font-bold text-cyan-100 rounded-xl transition-all border border-cyan-600/25 hover:border-sky-400/60 bg-slate-900/20 hover:bg-slate-900/30"
              >
                Go to Login
              </button>
            ) : null}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 font-bold text-cyan-100 rounded-xl transition-all border border-cyan-600/25 hover:border-sky-400/60 bg-slate-900/20 hover:bg-slate-900/30"
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
      className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-6 md:px-12 xl:px-24 overflow-hidden pt-20"
    >
      {/* Soft background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 left-0 w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-600/20 via-sky-500/15 to-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-700/15 via-sky-600/15 to-blue-500/10 blur-3xl" />
      </div>

      <header className="max-w-3xl mx-auto text-center mb-14 space-y-4">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-300 via-cyan-200 to-blue-200 drop-shadow-[0_0_10px_rgba(56,189,248,0.45)]">
          Search Posts
        </h1>
        <p className="text-sm md:text-base text-gray-300">
          Search anonymous posts by hashtags from around the world.
        </p>
      </header>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="w-5 h-5 text-cyan-300" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by hashtags (e.g., ghost art)"
            className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-cyan-600/30 text-cyan-100 placeholder-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400/60 transition"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-cyan-300 hover:text-sky-300 transition"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-cyan-300 mt-3 text-center">
            {filteredPosts.length} results for "{searchQuery}"
          </p>
        )}
      </div>

      {/* Posts Grid */}
      {!Array.isArray(filteredPosts) ? (
        <div className="text-center py-20">
          <p className="text-red-300 text-lg">Posts data is not available</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block p-6 bg-slate-800/50 border border-cyan-600/30 rounded-xl">
            {searchQuery ? (
              <>
                <p className="text-cyan-200 text-lg">No posts found matching your search</p>
                <p className="text-cyan-400 mt-2">Try different hashtags</p>
              </>
            ) : (
              <>
                <p className="text-cyan-200 text-lg">No anonymous posts found yet</p>
                <p className="text-cyan-400 mt-2">Be the first to share something!</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPosts.map((post, index) => (
            <PostCard key={post.postId} post={post} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Search;