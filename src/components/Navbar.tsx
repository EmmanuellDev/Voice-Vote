import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { FaEthereum } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import "../index.css"
import { MdExplore } from "react-icons/md";
import { FaPlusCircle } from "react-icons/fa";
import PP from "../assets/logo-dp.png";

const Navbar = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        }
      }
    };

    checkWalletConnection();

    // Listen for account changes
    window.ethereum?.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        setWalletAddress('');
        setIsConnected(false);
      } else {
        setWalletAddress(accounts[0]);
      }
    });
  }, []);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside click to close menu
  useEffect(() => {
    const handleOutsideClick = (event) => {
      const mobileMenuButton = document.querySelector('#mobile-menu-button');
      const mobileMenu = document.querySelector('#mobile-menu');

      if (
        isMenuOpen &&
        mobileMenu &&
        !mobileMenu.contains(event.target) &&
        (!mobileMenuButton || !mobileMenuButton.contains(event.target))
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMenuOpen]);

  // Close the mobile menu when a menu item is clicked
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const add0GMainnetNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x4105', // 16661 in hexadecimal
          chainName: '0G Mainnet',
          nativeCurrency: {
            name: '0G',
            symbol: '0G',
            decimals: 18
          },
          rpcUrls: ['https://evmrpc.0g.ai'],
          blockExplorerUrls: ['https://explorer.0g.ai']
        }]
      });
    } catch (error) {
      console.error('Error adding 0G Mainnet Network:', error);
    }
  };

  const switchTo0GMainnet = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4105' }] // 59902 in hexadecimal
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await add0GMainnetNetwork();
      } else {
        console.error('Error switching to 0G Mainnet:', switchError);
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Switch to 0G Mainnet
        await switchTo0GMainnet();
        
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const isActive = (path) => location.pathname === path;

  // Navigation items data
  const navItems = [
    { label: 'Explore', icon: MdExplore, path: '/explore' },
    { label: 'Search', icon: FiSearch, path: '/search' },
    { label: 'Create Post', icon: FaPlusCircle, path: '/create-post' },
    { label: 'Profile', icon: FiUser, path: '/profile' }
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out ${
        isScrolled
          ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-amber-100/80"
          : "bg-white/90 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-4 group flex-shrink-0">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-amber-400/20 via-red-400/20 to-yellow-400/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <img 
                src={PP}
                alt="Voice_Vote Logo" 
                className="relative h-11 w-11 object-contain transform group-hover:scale-110 transition-transform duration-500 drop-shadow-sm"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black bg-gradient-to-r from-amber-600 via-red-500 to-orange-500 bg-clip-text text-transparent tracking-tight">
                Voice
              </h1>
              <span className="text-[10px] text-amber-600 font-semibold tracking-[0.15em] -mt-0.5 uppercase">Vote</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1 mx-12">
            <div className="flex items-center bg-amber-50/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border border-amber-100">
              {navItems.map(({ label, icon: Icon, path }) => (
                <Link
                  key={label}
                  to={path}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                    isActive(path)
                      ? "bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-md transform scale-105"
                      : "text-amber-700 hover:text-amber-800 hover:bg-white/70"
                  }`}
                >
                  {isActive(path) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-red-500 rounded-xl shadow-lg"></div>
                  )}
                  <Icon 
                    size={16} 
                    className={`relative z-10 ${isActive(path) ? 'text-white' : 'text-amber-600'}`} 
                  />
                  <span className="relative z-10 font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Wallet & Mobile Toggle */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Wallet Connection - Desktop */}
<div className="hidden lg:block">
  {isConnected ? (
    <div className="flex items-center bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md">
      <div className="w-2 h-2 bg-black rounded-full mr-3 animate-pulse"></div>
      <FaEthereum className="mr-2 text-black" size={14} />
      <span className="font-mono">{shortenAddress(walletAddress)}</span>
    </div>
  ) : (
    <button
      onClick={connectWallet}
      className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
    >
      <FaEthereum size={14} />
      <span>Connect Wallet</span>
    </button>
  )}
</div>


            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden relative p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-amber-700 transition-all duration-300 shadow-sm"
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`lg:hidden absolute top-full left-0 right-0 transition-all duration-500 ease-out ${
          isMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-4"
        }`}
      >
        <div className="mx-4 mt-2 mb-6 bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-amber-100 overflow-hidden">
          
          {/* Mobile Navigation */}
          <div className="p-6 space-y-2">
            {navItems.map(({ label, icon: Icon, path }) => (
              <Link
                key={label}
                to={path}
                onClick={closeMenu}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-semibold transition-all duration-300 ${
                  isActive(path)
                    ? "bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-md"
                    : "text-amber-700 hover:bg-amber-50 active:bg-amber-100"
                }`}
              >
                <Icon size={20} className={isActive(path) ? 'text-white' : 'text-amber-600'} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
          
          {/* Mobile Wallet Section */}
<div className="px-6 pb-6 pt-2 border-t border-amber-100">
  {isConnected ? (
    <div className="flex items-center justify-center bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black px-5 py-4 rounded-2xl font-semibold shadow-md">
      <div className="w-2 h-2 bg-black rounded-full mr-3 animate-pulse"></div>
      <FaEthereum className="mr-3 text-black" size={16} />
      <span className="font-mono text-sm">{shortenAddress(walletAddress)}</span>
    </div>
  ) : (
    <button
      onClick={() => {
        connectWallet();
        closeMenu();
      }}
      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white px-5 py-4 rounded-2xl text-base font-semibold shadow-md active:scale-95 transition-all duration-300"
    >
      <FaEthereum size={18} />
      <span>Connect Wallet</span>
    </button>
  )}
</div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;