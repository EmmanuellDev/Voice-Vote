import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, 
  FiShield, 
  FiZap, 
  FiTrendingUp, 
  FiMessageCircle, 
  FiGlobe, 
  FiClock, 
  FiArrowRight,
  FiEye,
  FiBarChart2,
  FiThumbsUp,
  FiAward,
  FiHeart,
  FiTarget,
  FiCheckCircle
} from 'react-icons/fi';
import { 
  IoEarth, 
  IoPeople, 
  IoLockClosed, 
  IoRocket,
  IoSparkles,
  IoMegaphone,
  IoStatsChart,
  IoShieldCheckmark
} from 'react-icons/io5';

const Header: React.FC = () => {
  const [currentFeature, setCurrentFeature] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'features' | 'stats' | 'community'>('features');
  const navigate = useNavigate();

  // Update time every second
  useEffect(() => {
    const updateTime = (): void => {
      const now = new Date();
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

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev % 6) + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleExplore = (): void => {
    navigate('/register');
  };

  const mainFeatures = [
    {
      id: 1,
      icon: <IoLockClosed className="text-2xl" />,
      title: "Complete Anonymity",
      description: "Your identity remains protected with military-grade encryption while you voice concerns",
      stats: "100% anonymous posting",
      color: "from-amber-500 to-orange-500"
    },
    {
      id: 2,
      icon: <IoSparkles className="text-2xl" />,
      title: "AI-Powered Analysis",
      description: "Alith AI analyzes content and assigns urgency levels to ensure important issues get attention",
      stats: "95% accuracy rate",
      color: "from-red-500 to-rose-500"
    },
    {
      id: 3,
      icon: <IoPeople className="text-2xl" />,
      title: "Community Driven",
      description: "Join thousands of civic-minded individuals making real change in their communities",
      stats: "50K+ active members",
      color: "from-brown-500 to-amber-500"
    },
    {
      id: 4,
      icon: <IoMegaphone className="text-2xl" />,
      title: "Amplified Voice",
      description: "Your concerns reach relevant authorities and gain traction through community support",
      stats: "100K+ issues resolved",
      color: "from-orange-500 to-red-500"
    },
    {
      id: 5,
      icon: <IoStatsChart className="text-2xl" />,
      title: "Real-time Analytics",
      description: "Track issue progress, community engagement, and resolution status in real-time",
      stats: "Live updates 24/7",
      color: "from-yellow-500 to-amber-500"
    },
    {
      id: 6,
      icon: <IoShieldCheckmark className="text-2xl" />,
      title: "Verified Impact",
      description: "Get confirmation when your voiced concerns lead to tangible changes and solutions",
      stats: "75% success rate",
      color: "from-red-600 to-brown-600"
    }
  ];

  const platformStats = [
    { value: "75K+", label: "Registered Users", change: "+12% this month", icon: <FiUsers /> },
    { value: "150K+", label: "Issues Raised", change: "+25% growth", icon: <FiMessageCircle /> },
    { value: "45K+", label: "Issues Resolved", change: "Community driven", icon: <FiCheckCircle /> },
    { value: "98%", label: "User Satisfaction", change: "Based on reviews", icon: <FiHeart /> },
    { value: "2.5M+", label: "Total Engagements", change: "Likes & comments", icon: <FiThumbsUp /> },
    { value: "95%", label: "Anonymity Maintained", change: "Zero breaches", icon: <FiShield /> }
  ];

  const communityHighlights = [
    {
      title: "Park Renovation Success",
      description: "Community rallied for park maintenance - now completed with new facilities",
      supporters: "2.4K",
      status: "Completed"
    },
    {
      title: "Road Safety Campaign",
      description: "Speed bumps installed near school zones after 5K+ signatures",
      supporters: "5.1K",
      status: "In Progress"
    },
    {
      title: "Local Market Cleanup",
      description: "Weekly cleaning initiative started by community members",
      supporters: "1.8K",
      status: "Active"
    }
  ];

  const currentFeatureData = mainFeatures.find(f => f.id === currentFeature);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brown-50 via-amber-50 to-red-50 overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        {/* Floating elements */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-6 h-6 rounded-full bg-gradient-to-r from-amber-200 to-red-200 opacity-30"
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

      {/* Main Navigation */}
      <nav className="relative z-20 py-6 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-red-500 rounded-xl flex items-center justify-center">
              <IoMegaphone className="text-2xl text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-brown-600 to-red-600 bg-clip-text text-transparent">
              VoiceVote
            </span>
          </motion.div>
          
          <div className="flex items-center space-x-6">
            <button className="text-brown-600 hover:text-red-600 font-medium">About</button>
            <button className="text-brown-600 hover:text-red-600 font-medium">Features</button>
            <button className="text-brown-600 hover:text-red-600 font-medium">Community</button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExplore}
              className="bg-gradient-to-r from-amber-500 to-red-500 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Join Now
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center pt-10 pb-20 px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-100 border border-amber-200">
                <FiTrendingUp className="text-amber-600 mr-2" />
                <span className="text-sm font-medium text-amber-700">Trusted by 75,000+ users worldwide</span>
              </div>

              {/* Main Title */}
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-brown-900 via-red-600 to-amber-600 bg-clip-text text-transparent">
                  Your Voice, <br />
                </span>
                <span className="text-brown-800">Amplified Safely</span>
              </h1>

              {/* Description */}
              <p className="text-xl text-brown-700 leading-relaxed">
                VoiceVote is the premier decentralized platform where individuals anonymously voice 
                civic concerns while ensuring complete privacy and data integrity. 
                <span className="font-semibold text-red-600"> Powered by Alith AI</span> for intelligent issue prioritization.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExplore}
                  className="bg-gradient-to-r from-amber-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
                >
                  Start Your Journey
                  <FiArrowRight className="ml-2" />
                </motion.button>
                
                <button className="border-2 border-amber-500 text-amber-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-amber-50 transition-colors">
                  Watch Demo
                </button>
              </div>

              {/* Live Stats */}
              <div className="flex items-center space-x-6 pt-6">
                <div className="flex items-center space-x-3 text-brown-600">
                  <FiUsers className="text-xl" />
                  <span className="font-semibold">75K+ Active Users</span>
                </div>
                <div className="flex items-center space-x-3 text-brown-600">
                  <FiCheckCircle className="text-xl" />
                  <span className="font-semibold">45K+ Issues Resolved</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Feature Showcase */}
          <div className="relative">
            {/* Main Feature Card */}
            <motion.div
              key={currentFeature}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl border border-amber-100 p-8 relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${currentFeatureData?.color}`}></div>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${currentFeatureData?.color} flex items-center justify-center text-white`}>
                  {currentFeatureData?.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-brown-800">{currentFeatureData?.title}</h3>
                  <p className="text-amber-600 font-semibold">{currentFeatureData?.stats}</p>
                </div>
              </div>
              
              <p className="text-brown-700 text-lg leading-relaxed mb-6">
                {currentFeatureData?.description}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {mainFeatures.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index + 1)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentFeature === index + 1 ? 'bg-amber-500 w-6' : 'bg-amber-200'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="flex items-center space-x-2 text-brown-600">
                  <FiClock />
                  <span className="font-mono">{currentTime}</span>
                </div>
              </div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-red-500 text-white p-4 rounded-xl shadow-lg"
            >
              <FiEye className="text-2xl" />
            </motion.div>
            
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -left-4 bg-amber-500 text-white p-4 rounded-xl shadow-lg"
            >
              <FiBarChart2 className="text-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 bg-gradient-to-r from-amber-50 to-red-50 border-y border-amber-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-brown-800 mb-4">Making Real Impact</h2>
            <p className="text-xl text-brown-600">Join thousands who are already creating change</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-amber-100"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <div className="text-amber-600 text-xl">{stat.icon}</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-brown-800">{stat.value}</div>
                    <div className="text-brown-600">{stat.label}</div>
                    <div className="text-sm text-amber-600">{stat.change}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Highlights */}
      <section className="relative py-16 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-brown-800 mb-4">Community Success Stories</h2>
            <p className="text-xl text-brown-600">See how voices become actions</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {communityHighlights.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-gradient-to-br from-amber-50 to-red-50 rounded-xl p-6 shadow-lg border border-amber-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-brown-800">{story.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    story.status === 'Completed' ? 'bg-green-100 text-green-600' :
                    story.status === 'In Progress' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {story.status}
                  </span>
                </div>
                <p className="text-brown-700 mb-4">{story.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-brown-600">
                    <FiUsers />
                    <span>{story.supporters} supporters</span>
                  </div>
                  <FiHeart className="text-red-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 bg-gradient-to-r from-brown-600 to-red-600">
        <div className="max-w-4xl mx-auto text-center px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Ready to Make Your Voice Heard?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-amber-100 mb-8"
          >
            Join 75,000+ users who are already creating change in their communities. 
            Your anonymity is guaranteed, your impact is real.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExplore}
            className="bg-white text-brown-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Your Anonymous Journey Today
          </motion.button>
        </div>
      </section>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
};

export default Header;