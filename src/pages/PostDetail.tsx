import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { GrLike, GrDislike } from 'react-icons/gr';
import { motion } from 'framer-motion';
import { BD_PORT } from '../const';

// Define the Post interface
interface Post {
  postId: string;
  imageUrl: string;
  caption?: string;
  hashtags: string[];
  likeCount: number;
  dislikeCount: number;
  active: boolean;
  authorUsername?: string;
  walletAddress?: string;
  createdAt: string;
  authorState?: string;
  authorLevel?: string;
}

const PostDetails: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userInteraction, setUserInteraction] = useState<'like' | 'dislike' | null>(null);

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

  const handleLike = async () => {
    if (!post || userInteraction === 'like') return;

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
    if (!post || userInteraction === 'dislike') return;

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
        className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-10 left-0 w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-600/20 via-sky-500/15 to-blue-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-700/15 via-sky-600/15 to-blue-500/10 blur-3xl" />
        </div>
        <div className="flex flex-col items-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-cyan-600/30">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-cyan-500 mb-4"></div>
          <p className="text-cyan-200 font-medium">Loading post...</p>
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
        <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-cyan-600/30 text-center">
          <div className="text-red-300 text-xl mb-4">Error: {error}</div>
          <Link
            to="/explore"
            className="inline-flex items-center text-cyan-300 hover:text-sky-300 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
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
        className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-10 left-0 w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-600/20 via-sky-500/15 to-blue-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-700/15 via-sky-600/15 to-blue-500/10 blur-3xl" />
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-cyan-600/30 text-center">
          <div className="text-cyan-200 text-xl">Post not found</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-6 md:px-12 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 left-0 w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-600/20 via-sky-500/15 to-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-700/15 via-sky-600/15 to-blue-500/10 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto">
        <Link
          to="/explore"
          className="inline-flex items-center mb-6 text-cyan-300 hover:text-sky-300 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Explore
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-sm rounded-xl border border-cyan-600/30 hover:border-sky-400/60 overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_-8px_rgba(56,189,248,0.35)]"
        >
          <div className="relative overflow-hidden">
            <img
              src={post.imageUrl}
              alt={post.caption || 'Post'}
              className="w-full h-96 object-contain bg-slate-900 border-b border-cyan-600/30 group-hover:scale-105 transition-transform duration-500"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                e.currentTarget.className = 'w-full h-96 object-contain bg-slate-900';
              }}
            />
          </div>
          <div className="p-6">
            <div className="flex items-center mb-4 justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-500 flex items-center justify-center rounded-md shadow-[0_0_15px_rgba(56,189,248,0.9)] mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-cyan-100">
                    {post.authorUsername ||
                      (post.walletAddress
                        ? `${post.walletAddress.substring(0, 6)}...${post.walletAddress.substring(post.walletAddress.length - 4)}`
                        : 'Anonymous')}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-cyan-300">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    {post.authorState && post.authorState !== 'unknown' && (
                      <>
                        <span>•</span>
                        <span>{post.authorState}</span>
                      </>
                    )}
                    {post.authorLevel && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{post.authorLevel}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                className="py-2 px-4 font-bold text-cyan-100 rounded-xl transition-all border border-cyan-600/25 hover:border-sky-400/60 bg-slate-900/20 hover:bg-slate-900/30"
                onClick={async () => {
                  try {
                    const response = await fetch(post.imageUrl, { mode: 'cors' });
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = post.caption
                      ? post.caption.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg'
                      : `post_${post.postId}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error('Download error:', err);
                    alert('Failed to download image.');
                  }
                }}
                title="Download image"
              >
                <svg className="w-5 h-5 inline mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 4v12" />
                </svg>
                Download
              </button>
            </div>
            <p className="text-lg text-cyan-100 font-semibold mb-2">{post.caption || 'Untitled Post'}</p>
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.hashtags.map((tag: string, index: number) => (
                  <span key={index} className="bg-slate-900/50 border border-cyan-600/30 text-cyan-300 px-2 py-1 rounded-xl text-xs">
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between border-t border-cyan-600/30 pt-4 mt-4">
              <div className="flex space-x-6">
                <button
                  className={`flex items-center focus:outline-none transition-colors ${
                    userInteraction === 'like' ? 'text-green-400' : 'text-cyan-300 hover:text-green-300'
                  } group`}
                  onClick={handleLike}
                  title="Like"
                  disabled={userInteraction === 'like'}
                >
                  <GrLike className="h-5 w-5 mr-1" />
                  <span className="font-semibold">{post.likeCount || 0}</span>
                </button>
                <button
                  className={`flex items-center focus:outline-none transition-colors ${
                    userInteraction === 'dislike' ? 'text-red-400' : 'text-cyan-300 hover:text-red-300'
                  } group`}
                  onClick={handleDislike}
                  title="Dislike"
                  disabled={userInteraction === 'dislike'}
                >
                  <GrDislike className="h-5 w-5 mr-1" />
                  <span className="font-semibold">{post.dislikeCount || 0}</span>
                </button>
              </div>
              <div className="text-xs text-cyan-300">
                Post ID: {post.postId}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PostDetails;