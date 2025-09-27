import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiShield, FiZap, FiTrendingUp, FiMessageCircle, FiGlobe, FiClock, FiArrowRight } from 'react-icons/fi';
import { IoEarth, IoPeople, IoLockClosed, IoGlobe } from 'react-icons/io5';
import DISPLAY from '../assets/display.png';

const Header: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const navigate = useNavigate();

  // Update time every second in IST 12-hour format
  useEffect(() => {
    const updateTime = (): void => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Kolkata' };
      const timeInIST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      let hours = timeInIST.getHours();
      const minutes = timeInIST.getMinutes();
      const seconds = timeInIST.getSeconds();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const pad = (n: number): string => n.toString().padStart(2, '0');
      const formatted = ` ${pad(hours)} : ${pad(minutes)} : ${pad(seconds)} ${ampm} `;
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate features every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev % 4) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleExplore = (): void => {
    navigate('/register');
  };

  const features = [
    {
      id: 1,
      icon: <IoLockClosed className="text-2xl" />,
      title: "Complete Anonymity",
      description: "Your identity remains protected while you voice concerns",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 2,
      icon: <FiZap className="text-2xl" />,
      title: "AI-Powered Analysis",
      description: "Alith AI assigns urgency and categorizes your concerns",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 3,
      icon: <IoPeople className="text-2xl" />,
      title: "Community Driven",
      description: "Join thousands of civic-minded individuals",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: 4,
      icon: <IoGlobe className="text-2xl" />,
      title: "Global Impact",
      description: "Make your voice heard on local and global issues",
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { value: "50K+", label: "Active Users", icon: <FiUsers /> },
    { value: "100K+", label: "Issues Raised", icon: <FiMessageCircle /> },
    { value: "95%", label: "Anonymity Rate", icon: <FiShield /> },
    { value: "24/7", label: "Active Support", icon: <FiClock /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, 50, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      </div>

      <section className="relative min-h-[85vh] pt-6 text-gray-100 flex flex-col md:flex-row z-10">
        {/* Left Side - Text Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-16">
          <div className="max-w-lg mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-purple-300/20 mb-6"
            >
              <FiTrendingUp className="mr-2" />
              <span className="text-sm font-medium">Trusted by thousands worldwide</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl righteous lg:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent bg-size-200 animate-gradient"
            >
              Voice Vote 0G
            </motion.h1>
            
            {/* Subtitle */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl md:text-3xl alegra text-gray-300 mb-6 font-medium flex items-center"
            >
              <IoEarth className="mr-3 text-blue-400" />
              Anonymous Civic Voice Platform
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-gray-300 mb-8 text-lg alegra leading-relaxed"
            >
              Voice-Vote is a decentralized platform that empowers individuals to anonymously voice real-world civic concerns while ensuring data integrity and privacy. With Alith AI, post content is enhanced and analyzed to assign urgency.
            </motion.p>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 gap-4 mb-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
                  <div className="text-2xl text-purple-400 mr-3">{stat.icon}</div>
                  <div>
                    <div className="font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                onClick={handleExplore}
                className="relative bg-gradient-to-r cursor-pointer from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30 flex items-center group"
              >
                <span>Complete KYC</span>
                <motion.span
                  animate={{ x: isHovered ? 5 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-2"
                >
                  <FiArrowRight />
                </motion.span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>

              {/* Timer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex items-center px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-purple-300/30 shadow-lg"
              >
                <FiClock className="mr-3 text-purple-400" />
                <span className="font-mono text-purple-100 tracking-widest michroma">
                  {currentTime}
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Image and Features */}
        <div className="w-full md:w-1/2 relative flex items-center justify-center p-8">
          <div className="relative w-full max-w-2xl">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative z-10"
            >
              <img
                src={DISPLAY}
                alt="Voice Vote 0G Platform Preview"
                className="w-full rounded-3xl shadow-2xl border-2 border-white/10"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent rounded-3xl" />
            </motion.div>

            {/* Floating Feature Cards */}
            <AnimatePresence>
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: currentSlide === feature.id ? 1 : 0.6,
                    scale: currentSlide === feature.id ? 1 : 0.9,
                  }}
                  transition={{ duration: 0.5 }}
                  className={`absolute p-4 rounded-2xl backdrop-blur-md border ${
                    currentSlide === feature.id ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'
                  } shadow-2xl ${
                    index === 0 ? '-top-4 -left-4' :
                    index === 1 ? '-top-4 -right-4' :
                    index === 2 ? '-bottom-4 -left-4' :
                    '-bottom-4 -right-4'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-2`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-300">{feature.description}</p>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Slide Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index + 1)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index + 1 ? 'bg-purple-400 w-8' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="relative h-24 overflow-hidden">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute w-full h-full"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            className="fill-current text-purple-900"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            className="fill-current text-purple-800"
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            className="fill-current text-purple-600"
          ></path>
        </svg>
      </div>

      <style jsx>{`
        .bg-size-200 {
          background-size: 200% 200%;
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default Header;