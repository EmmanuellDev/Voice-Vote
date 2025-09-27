import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { FaEthereum } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import LOGOS from '../assets/logo.png';
import "../index.css"
import { MdExplore } from "react-icons/md";
import { FaPlusCircle } from "react-icons/fa";

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
          blockExplorerUrls: ['https://chainscan.0g.ai/']
        }]
      });
    } catch (error) {
      console.error('Error adding 0G Mainnet network:', error);
    }
  };

  const switchTo0GMainnet = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4105' }] // 16661 in hexadecimal
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
      className={`fixed top-0 w-full z-40 transition-all duration-300 ease-in-out backdrop-blur-xl border-b ${
        isScrolled
          ? "bg-amber-50/90 border-amber-200/60 shadow-[0_0_25px_-8px_rgba(251,191,36,0.25)]"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src={LOGOS}
                alt="Voice vote Logo" 
                className="h-12 w-12 object-contain transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-red-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-brown-700 via-amber-600 to-red-600 bg-clip-text text-transparent tracking-tight">
                Voice-Vote
              </h1>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex ml-6">
            <div className="flex items-center gap-2">
              {navItems.map(({ label, icon: Icon, path }) => (
                <Link
                  key={label}
                  to={path}
                  className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium tracking-wide transition-all group overflow-hidden border ${
                    isActive(path)
                      ? "border-red-400/60 bg-white/60 shadow-[0_0_18px_-4px_rgba(239,68,68,0.35)] text-brown-800"
                      : "border-amber-200/60 hover:border-red-300/70 bg-white/40 hover:bg-white/50 text-brown-700 hover:text-brown-800"
                  }`}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-100/0 via-red-100/30 to-yellow-100/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon size={16} className={isActive(path) ? "text-red-600" : "text-amber-600"} />
                  <span className="relative">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center border-red-400/60 border bg-white/60 px-4 py-2 rounded-xl text-sm font-medium text-brown-800 shadow-md">
                <FaEthereum className="text-amber-600 mr-2" />
                <span>{shortenAddress(walletAddress)}</span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium tracking-wide transition-all group overflow-hidden border border-amber-200/60 hover:border-red-300/70 bg-white/40 hover:bg-white/50 text-brown-700 hover:text-brown-800 shadow-md hover:shadow-lg"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-amber-100/0 via-red-100/30 to-yellow-100/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <FaEthereum size={16} className="text-amber-600" />
                <span className="relative">Connect Wallet</span>
              </button>
            )}

            {/* Mobile Toggle */}
            <button
              id="mobile-menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden relative p-2 rounded-lg border border-amber-200/60 bg-white/50 backdrop-blur-lg text-brown-700 hover:border-red-300/70 hover:bg-white/60 transition-all"
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Panel */}
      <div
        id="mobile-menu"
        className={`md:hidden transition-all duration-400 ease-out origin-top overflow-hidden ${
          isMenuOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-4 mt-2 mb-4 rounded-2xl border border-amber-200/60 bg-white/90 backdrop-blur-xl shadow-[0_0_25px_-8px_rgba(251,191,36,0.25)] p-4 space-y-2">
          {navItems.map(({ label, icon: Icon, path }) => (
            <Link
              key={label}
              to={path}
              onClick={closeMenu}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all border overflow-hidden ${
                isActive(path)
                  ? "border-red-400/60 bg-amber-50/70 shadow-[0_0_18px_-4px_rgba(239,68,68,0.25)] text-brown-800"
                  : "border-amber-200/50 hover:border-red-300/60 bg-white/40 hover:bg-amber-50/50 text-brown-700 hover:text-brown-800"
              }`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-amber-100/0 via-red-100/20 to-yellow-100/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Icon size={18} className={isActive(path) ? "text-red-600" : "text-amber-600"} />
              <span className="relative">{label}</span>
            </Link>
          ))}
          
          {/* Wallet connection in mobile menu */}
          <div className="pt-2 mt-2 border-t border-amber-200/60">
            {isConnected ? (
              <div className="flex items-center justify-center px-4 py-3 rounded-xl border border-red-400/60 bg-amber-50/70 shadow-md">
                <FaEthereum className="text-amber-600 mr-2" />
                <span className="text-brown-800 font-medium">{shortenAddress(walletAddress)}</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  connectWallet();
                  closeMenu();
                }}
                className="w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all border border-amber-200/50 hover:border-red-300/60 bg-white/40 hover:bg-amber-50/50 text-brown-700 hover:text-brown-800 shadow-md hover:shadow-lg"
              >
                <FaEthereum size={18} className="text-amber-600" />
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