import { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { abi } from '../abis/NullifierStorageABI.json';
import {
  AnonAadhaarProvider,
  LogInWithAnonAadhaar,
  useAnonAadhaar,
} from "@anon-aadhaar/react";
import { motion } from 'framer-motion';
import ErrorBoundary from "../components/errorBoundry";
import { BD_PORT } from '../const';

// Constants
const APP_ID = "736752789516906243413209479470929762177967151202";
const DEFAULT_NULLIFIER_SEED = 1234;
const statesList = [
  // States
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];
const CONTRACT_ADDRESS = "0xE940A67c83a9B9fDce85af250A1DABB3C5b8f38A";

// QR Scanner Component
const SimpleQRScanner = ({ onNullifierReady }) => {
  const [anonAadhaar] = useAnonAadhaar();
  const [nullifierId, setNullifierId] = useState(null);

  // Get or initialize the nullifier seed from localStorage
  const [nullifierSeed] = useState(() => {
    try {
      const storedSeed = localStorage.getItem('anon-aadhaar-nullifier-seed');
      if (!storedSeed) {
        localStorage.setItem('anon-aadhaar-nullifier-seed', DEFAULT_NULLIFIER_SEED.toString());
        return DEFAULT_NULLIFIER_SEED;
      }
      return parseInt(storedSeed);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return DEFAULT_NULLIFIER_SEED;
    }
  });

  // Clear previous login state on component mount
  useEffect(() => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.includes('anon-aadhaar') ||
         key.includes('anonAadhaar') ||
         key.includes('proof') ||
         key.includes('nullifier')) &&
        key !== 'anon-aadhaar-nullifier-seed'
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }, []);

  // Extract nullifier when logged in
  useEffect(() => {
    if (anonAadhaar.status === "logged-in") {
      const getProof = () => {
        if (anonAadhaar.anonAadhaarProof) return anonAadhaar.anonAadhaarProof;
        if (anonAadhaar.proof) return anonAadhaar.proof;
        if (anonAadhaar.anonAadhaarProofs) {
          return Array.isArray(anonAadhaar.anonAadhaarProofs)
            ? anonAadhaar.anonAadhaarProofs[0]
            : anonAadhaar.anonAadhaarProofs;
        }
        return null;
      };

      const proof = getProof();
      if (proof) {
        let nullifier = null;
        if (proof["0"] && proof["0"].pcd) {
          try {
            const pcdData = JSON.parse(proof["0"].pcd);
            nullifier = pcdData.proof?.nullifier;
          } catch {
            // Silent catch
          }
        }
        if (!nullifier) {
          nullifier = proof.nullifier ||
                     proof.nullifierHash ||
                     proof.nullifier_hash ||
                     proof.id;
        }
        if (nullifier) {
          const nullifierString = String(nullifier);
          setNullifierId(nullifierString);
          onNullifierReady(nullifierString, nullifierSeed);
        }
      }
    }
  }, [anonAadhaar, onNullifierReady, nullifierSeed]);

  // Handle the "Scan Again" action
  const handleScanAgain = () => {
    setNullifierId(null);
    onNullifierReady('');
    const seed = localStorage.getItem('anon-aadhaar-nullifier-seed');
    sessionStorage.clear();
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== 'anon-aadhaar-nullifier-seed') {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    if (seed) {
      localStorage.setItem('anon-aadhaar-nullifier-seed', seed);
    }
    window.location.reload();
  };

  return (
    <div className="p-6 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 backdrop-blur-sm rounded-xl border border-amber-200/60 hover:border-red-300/70 transition-all duration-300 mb-6 shadow-lg">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-amber-900">Aadhaar QR Code Scanner</h3>
      </div>
      
      {/* Information Panel */}
      <div className="mb-6 p-4 bg-white/70 rounded-lg border border-amber-200/50">
        <h4 className="text-sm font-semibold text-amber-900 mb-2">What happens during scanning?</h4>
        <div className="space-y-2 text-xs text-amber-800">
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>Your Aadhaar data is processed locally on your device</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>A unique nullifier hash is generated without revealing personal information</span>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>Zero-knowledge proofs ensure complete privacy protection</span>
          </div>
        </div>
      </div>

      <div className="mb-4 p-4 bg-white/50 rounded-xl border border-amber-200/40">
        <div className="flex items-center mb-2">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            anonAadhaar.status === "logged-in" ? "bg-green-500" :
            anonAadhaar.status === "loading" ? "bg-amber-500 animate-pulse" : "bg-red-500"
          }`}></div>
          <span className="text-amber-800 text-sm font-medium">
            Status: {anonAadhaar.status === "logged-in" ? "Successfully Connected" :
                    anonAadhaar.status === "loading" ? "Establishing Connection..." :
                    anonAadhaar.status === "logged-out" ? "Ready to Connect" : "Connection Failed"}
          </span>
        </div>
        <div className="text-xs text-amber-700">
          <span className="font-mono">App ID:</span> {APP_ID.substring(0, 12)}...{APP_ID.substring(APP_ID.length - 8)}
        </div>
      </div>
      
      {anonAadhaar.status === "loading" && (
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-3 border-amber-500 border-t-transparent rounded-full mb-3"></div>
            <p className="text-amber-600 text-sm font-medium">Establishing secure connection...</p>
            <p className="text-amber-700 text-xs mt-1">Please wait while we verify your device</p>
          </div>
        </div>
      )}
      
      {anonAadhaar.status !== "logged-in" && (
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
            <p className="text-amber-800 mb-2 font-medium">Ready to scan your Aadhaar QR code</p>
            <p className="text-amber-700 text-sm">Click the button below to begin the secure authentication process</p>
          </div>
          <div className="w-full">
            <LogInWithAnonAadhaar
              nullifierSeed={nullifierSeed}
              locale="en"
              styles={{
                button: {
                  background: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 50%, #b91c1c 100%)',
                  border: 'none',
                  color: 'white',
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 200ms ease-in-out',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                },
                dialogTitle: { color: 'white' },
                containerClassName: 'w-full max-w-sm mx-auto',
              }}
            />
          </div>
        </div>
      )}
      
      {anonAadhaar.status === "logged-in" && (
        <div className="mt-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-green-800 mb-4">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 mr-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-lg">QR Scan Successful!</span>
            </div>
            <div className="bg-white/70 p-4 rounded-lg border border-green-200/50 mb-3">
              <p className="text-sm font-semibold mb-2 text-green-800">Generated Nullifier Hash:</p>
              <div className="bg-white/80 p-3 rounded-lg font-mono text-sm break-all border border-green-200/40">
                <div className="text-amber-900">{nullifierId}</div>
              </div>
            </div>
            <div className="text-sm text-green-700 bg-green-100/50 p-3 rounded-lg">
              <p className="font-semibold mb-1">Privacy Protection Active:</p>
              <p>Your personal information remains completely anonymous while maintaining verification integrity.</p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleScanAgain}
              className="px-6 py-2 font-bold text-amber-900 rounded-xl transition-all border border-amber-200 hover:border-red-300 bg-white/70 hover:bg-amber-50/80 shadow-md hover:shadow-lg"
            >
              Scan Different QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Information Panel Component
const InfoPanel = ({ title, children, icon }) => (
  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border border-amber-200/60 mb-4">
    <div className="flex items-center mb-2">
      <div className="w-6 h-6 text-amber-600 mr-2">{icon}</div>
      <h4 className="text-sm font-bold text-amber-900">{title}</h4>
    </div>
    <div className="text-xs text-amber-800 leading-relaxed">{children}</div>
  </div>
);

const Register = () => {
  const [nullifier, setNullifier] = useState('');
  const [nullifierSeed, setNullifierSeed] = useState(null);
  const [checkResponse, setCheckResponse] = useState(null);
  const [state, setState] = useState('');
  const [password, setPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [registerResponse, setRegisterResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);

  // Handler for nullifier update from QR scanner
  const handleNullifierReady = (nullifierValue, seedValue) => {
    setNullifier(nullifierValue);
    setNullifierSeed(seedValue);
  };

  const checkNullifier = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BD_PORT}/auth/check-nullifier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nullifier }),
      });
      const data = await response.json();
      setCheckResponse(data);
    } catch (error) {
      console.error('Error checking nullifier:', error);
      setCheckResponse({ success: false, message: 'Error connecting to server' });
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        const contractInstance = new Contract(CONTRACT_ADDRESS, abi, signer);
        setContract(contractInstance);
        return address;
      } catch (error) {
        console.error('Error connecting wallet:', error);
        throw error;
      }
    } else {
      throw new Error('Please install MetaMask!');
    }
  };

  const storeNullifierOnChain = async () => {
    if (!contract) {
      try {
        await connectWallet();
      } catch (error) {
        alert(error.message);
        return null;
      }
    }
    try {
      setLoading(true);
      const tx = await contract.storeNullifier(nullifier);
      await tx.wait();
      setTxHash(tx.hash);
      return tx.hash;
    } catch (error) {
      console.error('Error storing nullifier on chain:', error);
      alert(`Error: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async () => {
    if (!checkResponse?.success) {
      alert('Please verify your nullifier first');
      return;
    }
    if (!txHash) {
      alert('Please store nullifier on chain first');
      return;
    }
    if (!state || !password) {
      alert('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BD_PORT}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nullifier, kycHash: txHash, walletAddress, state, password }),
      });
      const data = await response.json();
      setRegisterResponse(data);
      if (data.success) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
      }
    } catch (error) {
      console.error('Error registering user:', error);
      setRegisterResponse({ success: false, message: 'Error connecting to server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-red-50 flex flex-col items-center justify-center px-4 overflow-hidden"
    >
      {/* Enhanced Background Effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 left-0 w-96 h-96 rounded-full bg-gradient-to-tr from-amber-300/15 via-yellow-200/10 to-orange-200/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-red-300/10 via-amber-200/15 to-yellow-200/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-yellow-200/10 via-amber-300/10 to-red-200/10 blur-2xl" />
      </div>
      
      <div className="relative w-full max-w-6xl z-10 p-6">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-amber-500 via-red-500 to-yellow-600 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(251,191,36,0.4)] rounded-xl transform hover:scale-105 transition-transform duration-500">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-900 via-amber-700 to-red-700 drop-shadow-[0_0_15px_rgba(251,191,36,0.25)] mb-4">
            Voice-Vote Registration
          </h1>
          <p className="text-amber-800 text-lg max-w-3xl mx-auto leading-relaxed">
            Join the decentralized platform for anonymous civic participation. Complete your secure registration in three simple steps and become part of a community driving positive change.
          </p>
          
          {/* Registration Benefits */}
          <div className="grid md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
            <div className="bg-white/60 p-4 rounded-xl border border-amber-200/50">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-bold text-amber-900 text-sm mb-1">Complete Anonymity</h3>
              <p className="text-amber-700 text-xs">Zero-knowledge proofs protect your identity</p>
            </div>
            <div className="bg-white/60 p-4 rounded-xl border border-amber-200/50">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-amber-900 text-sm mb-1">Blockchain Security</h3>
              <p className="text-amber-700 text-xs">Immutable records on 0G Mainnet</p>
            </div>
            <div className="bg-white/60 p-4 rounded-xl border border-amber-200/50">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="font-bold text-amber-900 text-sm mb-1">Community Impact</h3>
              <p className="text-amber-700 text-xs">Join 75,000+ active civic participants</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Registration Flow */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl border border-amber-200/60 hover:border-red-300/70 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(251,191,36,0.3)] space-y-8">
              
              {/* Step 1: Scan Aadhaar QR and Get Nullifier */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-full font-bold text-lg mr-4 shadow-lg">
                    1
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-amber-900">Identity Verification</h2>
                    <p className="text-amber-700 text-sm">Scan your Aadhaar QR code for anonymous authentication</p>
                  </div>
                </div>
                <ErrorBoundary showDetails={false}>
                  <AnonAadhaarProvider
                    _autoconnect={false}
                    _debug={true}
                    _appId={APP_ID}
                  >
                    <SimpleQRScanner onNullifierReady={handleNullifierReady} />
                  </AnonAadhaarProvider>
                </ErrorBoundary>
                <div className="space-y-4 mt-4">
                  {nullifier && (
                    <button
                      onClick={checkNullifier}
                      disabled={loading || !nullifier}
                      className="w-full py-3 font-bold text-amber-900 rounded-xl transition-all border border-amber-200 hover:border-red-300 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      {loading ? (
                        <span className="flex justify-center items-center gap-2">
                          <div className="animate-spin h-5 w-5 border-2 border-amber-900 border-t-transparent rounded-full"></div>
                          Verifying Identity...
                        </span>
                      ) : 'Verify Nullifier Hash'}
                    </button>
                  )}
                  {checkResponse && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border ${checkResponse.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}
                    >
                      <div className="flex items-center gap-2">
                        {checkResponse.success ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className="font-semibold">{checkResponse.message}</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Step 2: Store on Chain */}
              {checkResponse?.success && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-full font-bold text-lg mr-4 shadow-lg">
                      2
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-amber-900">Blockchain Registration</h2>
                      <p className="text-amber-700 text-sm">Store your nullifier hash on the 0G Mainnet for immutable verification</p>
                    </div>
                  </div>
                  {!walletAddress ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl border border-amber-200/50">
                        <h4 className="font-semibold text-amber-900 mb-2">Why connect your wallet?</h4>
                        <div className="text-sm text-amber-800 space-y-1">
                          <p>• Creates an immutable record of your registration</p>
                          <p>• Enables secure, decentralized authentication</p>
                          <p>• Ensures your voting rights are permanently recorded</p>
                        </div>
                      </div>
                      <button
                        onClick={connectWallet}
                        className="w-full py-4 font-bold text-white rounded-xl transition-all bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-6 h-6 inline mr-3 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                        </svg>
                        Connect MetaMask Wallet
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white/80 p-4 rounded-xl border border-amber-200 shadow-inner">
                        <div className="flex items-center mb-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <p className="text-amber-800 text-sm font-semibold">Wallet Connected Successfully</p>
                        </div>
                        <p className="text-amber-900 font-mono text-sm break-all bg-amber-50/50 p-2 rounded">{walletAddress}</p>
                      </div>
                      <button
                        onClick={storeNullifierOnChain}
                        disabled={!!txHash || loading}
                        className="w-full py-4 font-bold text-white rounded-xl transition-all bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        {loading ? (
                          <span className="flex justify-center items-center gap-2">
                            <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full"></div>
                            Processing Transaction...
                          </span>
                        ) : txHash ? (
                          <>
                            <svg className="w-6 h-6 inline mr-3 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Successfully Stored on Blockchain
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6 inline mr-3 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Store Nullifier on Blockchain
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  {txHash && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl"
                    >
                      <div className="flex items-center text-green-800 mb-3">
                        <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-bold text-lg">Blockchain Transaction Successful!</span>
                      </div>
                      <div className="bg-white/70 p-3 rounded-lg mb-3">
                        <p className="text-sm font-semibold text-green-800 mb-1">Transaction Hash:</p>
                        <p className="font-mono text-xs text-green-700 break-all">{txHash}</p>
                      </div>
                      <a
                        href={`https://chainscan.0g.ai/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-amber-700 hover:text-red-700 font-semibold text-sm transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Transaction on Explorer
                      </a>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Registration */}
              {txHash && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                  <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-full font-bold text-lg mr-4 shadow-lg">
                      3
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-amber-900">Complete Your Profile</h2>
                      <p className="text-amber-700 text-sm">Final step to join the Voice-Vote's community</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block mb-2 text-sm font-bold text-amber-900">
                        Select Your State/Union Territory
                      </label>
                      <div className="relative">
                        <select
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/90 border border-amber-200 text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-3 focus:ring-red-200 focus:border-red-400 transition appearance-none shadow-inner"
                        >
                          <option value="">Choose your state or territory...</option>
                          {statesList.map((s) => (
                            <option key={s} value={s} className="py-2">{s}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-bold text-amber-900">
                        Create Secure Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter a strong password (minimum 8 characters)"
                          className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/90 border border-amber-200 text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-3 focus:ring-red-200 focus:border-red-400 transition shadow-inner"
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={registerUser}
                      disabled={loading || !state || !password}
                      className="w-full py-4 font-bold text-white rounded-xl transition-all bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <span className="flex justify-center items-center gap-2">
                          <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full"></div>
                          Creating Your Account...
                        </span>
                      ) : (
                        <>
                          <svg className="w-6 h-6 inline mr-3 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          Complete Registration & Join Voice-Vote
                        </>
                      )}
                    </button>
                    {registerResponse && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 rounded-xl border ${registerResponse.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                      >
                        {registerResponse.success ? (
                          <div className="text-green-800">
                            <div className="flex items-center mb-4">
                              <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xl font-bold">Welcome to Voice-Vote!</span>
                            </div>
                            {registerResponse.user && (
                              <div className="space-y-3 text-sm bg-white/70 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <span className="text-amber-700 font-semibold">User ID:</span>
                                    <span className="ml-2 font-mono text-amber-900">{registerResponse.user.id}</span>
                                  </div>
                                  <div>
                                    <span className="text-amber-700 font-semibold">Username:</span>
                                    <span className="ml-2 text-amber-900">{registerResponse.user.username}</span>
                                  </div>
                                  <div className="md:col-span-2">
                                    <span className="text-amber-700 font-semibold">KYC Hash:</span>
                                    <span className="ml-2 font-mono text-xs text-amber-900 break-all">{registerResponse.user.kycHash}</span>
                                  </div>
                                  <div className="md:col-span-2">
                                    <span className="text-amber-700 font-semibold">Wallet Address:</span>
                                    <span className="ml-2 font-mono text-xs text-amber-900 break-all">{registerResponse.user.walletAddress}</span>
                                  </div>
                                  <div>
                                    <span className="text-amber-700 font-semibold">State:</span>
                                    <span className="ml-2 text-amber-900">{registerResponse.user.state}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                              <p className="text-amber-800 font-semibold">
                                Redirecting to login page in a moment...
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-800">
                            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold">{registerResponse.message}</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Information Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <InfoPanel
                title="Privacy & Security"
                icon={<svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
              >
                <p>Your personal information is never stored or transmitted. The anonymous nullifier hash ensures your privacy while maintaining verification integrity through zero-knowledge cryptographic proofs.</p>
              </InfoPanel>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <InfoPanel
                title="Blockchain Technology"
                icon={<svg fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg>}
              >
                <p>Your registration is stored on the 0G Mainnet blockchain, creating an immutable and tamper-proof record. This ensures the integrity of the voting system and prevents duplicate registrations.</p>
              </InfoPanel>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <InfoPanel
                title="Community Impact"
                icon={<svg fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>}
              >
                <p>Join over 75,000 registered users who are actively participating in democratic processes. Your voice contributes to meaningful civic engagement and community-driven solutions.</p>
              </InfoPanel>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <div className="bg-gradient-to-br from-amber-100 via-yellow-50 to-red-100 p-6 rounded-xl border border-amber-200/60 shadow-lg">
                <h4 className="text-lg font-bold text-amber-900 mb-3">Registration Benefits</h4>
                <div className="space-y-3 text-sm text-amber-800">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Anonymous participation in civic discussions and voting</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Access to state-specific local governance issues</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>AI-powered issue analysis and priority recommendations</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Community-driven problem-solving initiatives</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;