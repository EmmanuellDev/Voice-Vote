import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BD_PORT } from '../const';
import { FiHeart, FiMessageSquare, FiShare2, FiDownload, FiArrowLeft, FiMapPin, FiCalendar, FiUser, FiFlag } from 'react-icons/fi';
import { FaHeart, FaRegHeart, FaRegComment, FaShare, FaFire, FaSeedling, FaCrown } from 'react-icons/fa';

// Define the Post interface
interface Post {
  postId: string;
  imageUrl: string;
  caption?: string;
  hashtags: string[];
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  active: boolean;
  authorUsername?: string;
  walletAddress?: string;
  createdAt: string;
  authorState?: string;
  authorLevel?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
}

const PostDetails: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userInteraction, setUserInteraction] = useState<'like' | 'dislike' | null>(null);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      : {};
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

  const getUserLevelIcon = (level: string) => {
    switch (level) {
      case 'super_active': return <FaCrown className="text-amber-500" />;
      case 'active': return <FaFire className="text-red-500" />;
      default: return <FaSeedling className="text-green-500" />;
    }
  };

  const handleLike = async () => {
    if (!post) return;

    try {
      const response = await axios.post<{ success: boolean; post: Post }>(
        `${BD_PORT}/api/posts/${postId}/like`,
        {},
        getAuthConfig()
      );

      if (response.data.success) {
        setPost((prev) => ({
          ...prev!,
          likeCount: response.data.post.likeCount,
          dislikeCount: response.data.post.dislikeCount,
        }));
        setIsLiked(true);
        setUserInteraction('like');
      }
    } catch (err: any) {
      console.error('Like error:', err);
      if (err.response?.status === 401) {
        alert('Please log in to like posts.');
      } else if (err.response?.status === 400) {
        alert(err.response.data.message || 'You have already liked this post.');
      } else {
        alert('Failed to like post.');
      }
    }
  };

  const handleDislike = async () => {
    if (!post) return;

    try {
      const response = await axios.post<{ success: boolean; post: Post }>(
        `${BD_PORT}/api/posts/${postId}/dislike`,
        {},
        getAuthConfig()
      );

      if (response.data.success) {
        setPost((prev) => ({
          ...prev!,
          likeCount: response.data.post.likeCount,
          dislikeCount: response.data.post.dislikeCount,
          active: response.data.post.active,
        }));
        setUserInteraction('dislike');

        if (!response.data.post.active) {
          alert('This post has been deactivated due to excessive dislikes.');
        }
      }
    } catch (err: any) {
      console.error('Dislike error:', err);
      if (err.response?.status === 401) {
        alert('Please log in to dislike posts.');
      } else if (err.response?.status === 400) {
        alert(err.response.data.message || 'You have already disliked this post.');
      } else {
        alert('Failed to dislike post.');
      }
    }
  };

  const handleDownload = async () => {
    if (!post) return;

    setIsDownloading(true);
    try {
      const response = await fetch(post.imageUrl, { mode: 'cors' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = post.caption
        ? post.caption.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg'
        : `community_concern_${post.postId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download image.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.caption || 'Community Concern',
        text: post?.description || 'Check out this community concern on VoiceVote',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get<{ success: boolean; post?: Post; message?: string }>(
          `${BD_PORT}/api/posts/${postId}`,
          getAuthConfig()
        );

        if (response.data.success) {
          setPost(response.data.post || null);
        } else {
          setError(response.data.message || 'Failed to fetch post');
        }
      } catch (err: any) {
        console.error('Fetch error:', err);
        if (err.response?.status === 404) {
          setError('Post not found');
        } else if (err.response?.status === 403) {
          setError('You can only view posts from your state');
        } else if (err.response?.status === 401) {
          setError('Please log in to view posts');
        } else {
          setError(err.response?.data?.message || 'Failed to load post');
        }
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-brown-50 flex items-center justify-center overflow-hidden pt-20"
      >
        <div className="flex flex-col items-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-amber-200 shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500 mb-4"></div>
          <p className="text-brown-700 font-medium">Loading community concern...</p>
          <p className="text-brown-500 text-sm mt-2">Getting post details</p>
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
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-amber-200 shadow-lg text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-brown-800 mb-2">Error Loading Post</h3>
          <p className="text-brown-600 mb-6">{error}</p>
          <Link
            to="/explore"
            className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-xl hover:from-amber-600 hover:to-red-600 transition-all shadow-lg"
          >
            <FiArrowLeft className="mr-2" />
            Back to Explore
          </Link>
        </div>
      </motion.div>
    );
  }

  if (!post) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-brown-50 flex items-center justify-center overflow-hidden pt-20"
      >
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-amber-200 shadow-lg text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiFlag className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-brown-800 mb-2">Post Not Found</h3>
          <p className="text-brown-600">The requested community concern could not be found.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-brown-50 py-8 px-4 sm:px-6 lg:px-8 overflow-hidden pt-20"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/explore"
          className="inline-flex items-center mb-6 text-brown-600 hover:text-brown-800 transition-colors group"
        >
          <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Community Concerns
        </Link>

        {/* Main Post Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          {/* Image Section */}
          <div className="relative">
            <img
              src={post.imageUrl}
              alt={post.caption || 'Community Concern'}
              className="w-full h-96 object-cover border-b border-amber-200"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = 'https://via.placeholder.com/800x600/FFEDD5/7C2D12?text=Image+Not+Found';
                e.currentTarget.className = 'w-full h-96 object-cover bg-amber-50 border-b border-amber-200';
              }}
            />
            
            {/* Urgency Badge */}
            {post.urgency && (
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold ${getUrgencyColor(post.urgency)}`}>
                {post.urgency.toUpperCase()} PRIORITY
              </div>
            )}

            {/* Action Buttons Overlay */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDownload}
                disabled={isDownloading}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-brown-600 hover:text-amber-600 transition-colors shadow-lg"
                title="Download image"
              >
                <FiDownload className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-brown-600 hover:text-amber-600 transition-colors shadow-lg"
                title="Share post"
              >
                <FiShare2 className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Author Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-red-400 rounded-xl flex items-center justify-center shadow-lg">
                  <FiUser className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-brown-800">
                      {post.authorUsername || 'Anonymous Community Member'}
                    </h3>
                    {post.authorLevel && getUserLevelIcon(post.authorLevel)}
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-brown-500 mt-1">
                    <div className="flex items-center space-x-1">
                      <FiCalendar size={12} />
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    {post.authorState && post.authorState !== 'unknown' && (
                      <div className="flex items-center space-x-1">
                        <FiMapPin size={12} />
                        <span>{post.authorState}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Caption and Description */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-brown-800 mb-3">
                {post.caption || 'Community Concern'}
              </h2>
              {post.description && (
                <p className="text-brown-600 leading-relaxed mb-4">
                  {post.description}
                </p>
              )}
            </div>

            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.hashtags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium border border-amber-200"
                  >
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}

            {/* Engagement Stats */}
            <div className="flex items-center justify-between border-t border-amber-200 pt-4">
              <div className="flex items-center space-x-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                    isLiked
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-amber-50 text-brown-600 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                  <span className="font-semibold">{post.likeCount || 0}</span>
                  <span>Support</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDislike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                    userInteraction === 'dislike'
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-gray-50 text-brown-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <FiFlag />
                  <span className="font-semibold">{post.dislikeCount || 0}</span>
                  <span>Report</span>
                </motion.button>

                <div className="flex items-center space-x-2 text-brown-500">
                  <FaRegComment />
                  <span className="font-semibold">{post.commentCount || 0}</span>
                  <span>Comments</span>
                </div>
              </div>

              {/* Post Status */}
              <div className="text-right">
                <div className="text-xs text-brown-400 mb-1">Post ID: {post.postId}</div>
                <div className={`text-xs font-semibold ${
                  post.active ? 'text-green-600' : 'text-red-600'
                }`}>
                  {post.active ? 'Active' : 'Under Review'}
                </div>
              </div>
            </div>

            {/* Community Impact Message */}
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center space-x-2 text-amber-700">
                <FaSeedling className="flex-shrink-0" />
                <p className="text-sm">
                  <strong>Community Impact:</strong> Your engagement helps prioritize local issues and drive positive change.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Related Posts Suggestion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-brown-800 mb-4 flex items-center">
            <FaFire className="mr-2 text-amber-600" />
            More Community Concerns
          </h3>
          <p className="text-brown-600 mb-4">
            Explore other issues in your community that need attention.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors border border-amber-200"
          >
            Browse All Concerns
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PostDetails;