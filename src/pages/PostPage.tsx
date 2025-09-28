import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiHash, FiZap, FiImage, FiEdit3 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { BD_PORT, AI_URL_PORT } from '../const';
import { FaMagic, FaRegLightbulb, FaShieldAlt } from 'react-icons/fa';

const CreatePost: React.FC = () => {
  const [caption, setCaption] = useState<string>('');
  const [hashtags, setHashtags] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isAiSuggesting, setIsAiSuggesting] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ caption: string; hashtags: string[] } | null>(null);
  const navigate = useNavigate();

  // Pinata IPFS configuration
  const pinataApiKey: string = 'c5f3a546a5f420344f13';
  const pinataSecretApiKey: string = '4d2785eeba3eda195aaf2aedd953089ac2571db59ccae266ee96170bb6c3c175';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }

      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const uploadToIPFS = async (): Promise<string> => {
    if (!imageFile) {
      throw new Error('No image selected');
    }

    const formData = new FormData();
    formData.append('file', imageFile);

    const metadata = JSON.stringify({
      name: `voicevote-post-${Date.now()}`,
      keyvalues: {
        app: 'voicevote-app',
      },
    });
    formData.append('pinataMetadata', metadata);

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey,
          },
        }
      );

      return `https://green-obedient-lizard-820.mypinata.cloud/ipfs/${response.data.IpfsHash}`;
    } catch (err) {
      console.error('Error uploading to IPFS:', err);
      throw new Error('Failed to upload image to IPFS');
    }
  };

  const handleAiSuggest = async () => {
    if (!caption.trim()) {
      setError('Please enter some content in the caption field first');
      return;
    }

    setIsAiSuggesting(true);
    setError('');

    try {
      const response = await axios.post<{ caption: string; hashtags: string[] }>(
        `${AI_URL_PORT}/api/ai-suggest-caption`,
        {
          content: caption.trim(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data) {
        setAiSuggestion(response.data);
        setCaption(response.data.caption);
        const hashtagsString = response.data.hashtags
          .map((tag: string) => (tag.startsWith('#') ? tag : `#${tag}`))
          .join(', ');
        setHashtags(hashtagsString);
        setSuccess('AI suggestions applied successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      console.error('AI suggestion error:', err);
      if (err.response?.status === 400) {
        setError(err.response.data.error || 'Content not appropriate for civic reporting. Please focus on community issues.');
      } else if (err.response?.status === 500) {
        setError('AI service temporarily unavailable. Please try again later.');
      } else {
        setError('Failed to get AI suggestions. Please check your internet connection and try again.');
      }
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!imageFile) {
      setError('Please select an image to upload');
      return;
    }

    if (!caption.trim()) {
      setError('Please add a caption');
      return;
    }

    setIsUploading(true);

    try {
      const imageUrl = await uploadToIPFS();
      const hashtagsArray = hashtags
        .split(',')
        .map((tag: string) => tag.trim().replace('#', '').trim())
        .filter((tag: string) => tag.length > 0);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      const response = await axios.post<{ success: boolean; message?: string }>(
        `${BD_PORT}/api/posts`,
        {
          caption: caption.trim(),
          hashtags: hashtagsArray,
          imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.success) {
        setSuccess('Post created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/explore');
        }, 1500);
      } else {
        throw new Error(response.data?.message || 'Failed to create post');
      }
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create post');
    } finally {
      setIsUploading(false);
    }
  };

  const tips = [
    {
      icon: <FaShieldAlt className="text-amber-600" />,
      text: "Your post will be completely anonymous"
    },
    {
      icon: <FaRegLightbulb className="text-amber-600" />,
      text: "Focus on civic issues and community concerns"
    },
    {
      icon: <FiHash className="text-amber-600" />,
      text: "Use relevant hashtags for better discovery"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-brown-50 pt-20 py-8 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

      <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Left Side - Tips and Guidelines */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-1"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 shadow-lg p-6 sticky top-24">
            <h2 className="text-2xl font-bold text-brown-800 mb-4">Create a Post</h2>
            <p className="text-brown-600 mb-6">
              Share community concerns and civic issues anonymously. Your voice matters.
            </p>
            
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-brown-700 flex items-center">
                <FaMagic className="mr-2 text-amber-600" />
                Quick Tips
              </h3>
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                    {tip.icon}
                  </div>
                  <p className="text-sm text-brown-600">{tip.text}</p>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h4 className="font-semibold text-amber-700 mb-2">Community Guidelines</h4>
              <ul className="text-xs text-amber-600 space-y-1">
                <li>• Focus on civic and community issues</li>
                <li>• Be respectful and constructive</li>
                <li>• Avoid personal information</li>
                <li>• Use clear, descriptive captions</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FiEdit3 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-brown-800 mb-2">Share Your Concern</h1>
              <p className="text-brown-600">Post anonymously to the community</p>
            </div>

            {/* Alerts */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>{error}</span>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>{success}</span>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-brown-700 mb-3 text-sm font-semibold">Upload Image</label>
                {previewUrl ? (
                  <div className="relative group">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-xl border-2 border-amber-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-600 hover:bg-red-50 transition-colors shadow-lg"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-amber-300 rounded-xl cursor-pointer hover:border-amber-400 transition-colors bg-amber-50/50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiUpload className="w-12 h-12 mb-4 text-amber-500" />
                      <p className="mb-2 text-lg font-semibold text-brown-700">
                        Click to upload image
                      </p>
                      <p className="text-sm text-brown-500">
                        PNG, JPG, GIF (Max. 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {/* Caption Field */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label htmlFor="caption" className="text-sm font-semibold text-brown-700">
                    Concern Description
                  </label>
                  <motion.button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={isAiSuggesting || !caption.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 border border-amber-300 rounded-xl hover:bg-amber-200 hover:border-amber-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAiSuggesting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border border-amber-600 border-t-transparent rounded-full"></div>
                        AI Working...
                      </>
                    ) : (
                      <>
                        <FiZap className="w-4 h-4" />
                        Enhance with AI
                      </>
                    )}
                  </motion.button>
                </div>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCaption(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-white text-brown-800 placeholder-brown-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all resize-none"
                  placeholder="Describe the community concern or civic issue... (e.g., water problem in sector 15, road damage near school, etc.)"
                  rows={4}
                  maxLength={2200}
                />
                <p className="mt-2 text-sm text-brown-500">
                  Describe the issue clearly. Use AI enhancement for better visibility.
                </p>
              </div>

              {/* Hashtags Field */}
              <div className="mb-8">
                <label htmlFor="hashtags" className="block mb-3 text-sm font-semibold text-brown-700">
                  Hashtags
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiHash className="w-5 h-5 text-amber-500" />
                  </div>
                  <input
                    id="hashtags"
                    type="text"
                    value={hashtags}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHashtags(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-amber-200 bg-white text-brown-800 placeholder-brown-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
                    placeholder="community, infrastructure, safety, environment"
                  />
                </div>
                <p className="mt-2 text-sm text-brown-500">
                  Separate with commas. AI suggestions will include # symbols.
                </p>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isUploading}
                whileHover={{ scale: isUploading ? 1 : 1.02 }}
                whileTap={{ scale: isUploading ? 1 : 0.98 }}
                className="w-full py-4 font-bold text-white rounded-xl transition-all bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {isUploading ? (
                  <span className="flex justify-center items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    Publishing Your Concern...
                  </span>
                ) : (
                  <span className="flex justify-center items-center gap-3">
                    <FiImage className="w-5 h-5" />
                    Publish Anonymously
                  </span>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreatePost;