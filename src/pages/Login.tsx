import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiUser, FiLock, FiLogIn, FiArrowRight } from "react-icons/fi";
import { FaFire, FaUsers, FaShieldAlt } from "react-icons/fa";
import { BD_PORT } from "../const";

// Interface for form data
interface FormData {
  username: string;
  password: string;
}

// Interface for API response
interface LoginResponse {
  message?: string;
  token?: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ username: "", password: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BD_PORT}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data: LoginResponse = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token!);
      navigate("/profile");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: "Complete Anonymity",
      description: "Your identity stays protected"
    },
    {
      icon: <FaUsers className="text-2xl" />,
      title: "Join 75K+ Users",
      description: "Be part of our community"
    },
    {
      icon: <FaFire className="text-2xl" />,
      title: "Make an Impact",
      description: "Voice concerns that matter"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-brown-50 flex items-center justify-center px-4 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 rounded-full bg-gradient-to-r from-amber-200 to-red-200 opacity-20"
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: i * 0.7,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left Side - Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block"
        >
          <div className="space-y-8">
            {/* Logo and Title */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-red-500 rounded-xl flex items-center justify-center">
                  <FiUser className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-brown-600 to-red-600 bg-clip-text text-transparent">
                    VoiceVote
                  </h1>
                  <p className="text-brown-600 font-medium">0G Anonymous Platform</p>
                </div>
              </div>
              
              <h2 className="text-4xl font-bold text-brown-800 leading-tight">
                Welcome Back to Your <span className="text-amber-600">Community</span>
              </h2>
              <p className="text-brown-600 text-lg">
                Sign in to continue making your voice heard anonymously and securely.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-amber-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-red-400 rounded-lg flex items-center justify-center text-white">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-brown-800">{feature.title}</h3>
                    <p className="text-brown-600 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-3 bg-white/50 rounded-lg border border-amber-200">
                <div className="text-2xl font-bold text-amber-600">75K+</div>
                <div className="text-brown-600 text-xs">Active Users</div>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-lg border border-amber-200">
                <div className="text-2xl font-bold text-red-600">150K+</div>
                <div className="text-brown-600 text-xs">Posts Shared</div>
              </div>
              <div className="text-center p-3 bg-white/50 rounded-lg border border-amber-200">
                <div className="text-2xl font-bold text-brown-600">45K+</div>
                <div className="text-brown-600 text-xs">Issues Solved</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full max-w-md mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200 shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-red-500 rounded-xl flex items-center justify-center">
                  <FiUser className="text-xl text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-brown-600 to-red-600 bg-clip-text text-transparent">
                    VoiceVote
                  </h1>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-brown-800">Welcome Back</h2>
              <p className="text-brown-600 mt-2">Sign in to your account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-brown-700">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-brown-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-amber-200 bg-white/50 text-brown-800 placeholder-brown-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-brown-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-brown-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-amber-200 bg-white/50 text-brown-800 placeholder-brown-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-brown-400 hover:text-brown-600 transition"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-amber-300 text-amber-600 focus:ring-amber-400" />
                  <span className="text-sm text-brown-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-4 font-bold text-white rounded-xl transition-all bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex justify-center items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex justify-center items-center gap-2">
                    <FiLogIn size={18} />
                    Sign In to VoiceVote
                    <FiArrowRight size={16} />
                  </span>
                )}
              </motion.button>
            </form>

            {/* Register Link */}
            <div className="text-center mt-6 pt-6 border-t border-amber-200">
              <p className="text-brown-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </div>

            {/* Security Note */}
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center space-x-2 text-amber-700 text-xs">
                <FaShieldAlt className="flex-shrink-0" />
                <span>Your login is secure and anonymous. We never share your personal data.</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;