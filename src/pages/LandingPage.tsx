import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DISPLAY from '../assets/display.png';

const Header: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<string>('');
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
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const pad = (n: number): string => n.toString().padStart(2, '0');
      const formatted = ` ${pad(hours)} : ${pad(minutes)} : ${pad(seconds)} ${ampm} `;
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev % 3) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleExplore = (): void => {
    navigate('/register');
  };

  return (
    <section className="min-h-[85vh] pt-6 bg-gray-900 text-gray-100 flex flex-col md:flex-row">
      {/* Left Side - Text Content */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-16">
        <div className="max-w-lg mx-auto">
          {/* Title */}
          <h1 className="text-4xl md:text-6xl righteous lg:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            Voice Vote 0G
          </h1>
          
          {/* Subtitle */}
          <h2 className="text-2xl md:text-5xl alegra text-gray-300 mb-6 font-medium">
            Anonymous Civic Voice Platform
          </h2>

          {/* Description */}
          <p className="text-gray-300 mb-8 text-2xl alegra leading-relaxed">
            Voice-Vote is a decentralized platform that empowers individuals to anonymously voice real-world civic concerns while ensuring data integrity and privacy. With Alith AI, post content is enhanced and analyzed to assign urgency.
          </p>
          
          {/* Explore Button and Timer Side by Side */}
          <div className="mb-12 mt-2 flex flex-col items-start sm:items-start">
            <button
              onClick={handleExplore}
              className="bg-gradient-to-r cursor-pointer righteous from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 transform hover:scale-105 mb-2 sm:mb-0"
            >
              Complete KYC
            </button>
            {/* Timer below Explore Button */}
            <span className="text-lg mt-7 font-mono px-8 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-purple-300/30 shadow-lg text-purple-100 tracking-widest select-none uppercase michroma transition-all duration-300 mt-2">
              {currentTime}
            </span>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="w-full md:w-1/2 relative overflow-hidden">
        <img
          src={DISPLAY}
          alt="Voice Vote 0G Platform Preview"
          className="w-[75%] h-[75%] pt-22 object-cover md:rounded-l-3xl lg:rounded-l-[40px] shadow-2xl"
        />
        {/* Optional overlay */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-gray-900/30 to-transparent"></div>
      </div>
    </section>
  );
};

export default Header;