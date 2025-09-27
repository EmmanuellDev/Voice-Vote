import { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { abi } from '../abi/NullifierStorageABI.json';
import {
  AnonAadhaarProvider,
  LogInWithAnonAadhaar,
  useAnonAadhaar,
  AnonAadhaarProof,
} from "@anon-aadhaar/react";
import { motion } from 'framer-motion';
import ErrorBoundary from "../components/ErrorBoundary";
import { BD_PORT } from '../const';

// Constants
const APP_ID: string = "736752789516906243413209479470929762177967151202";
const DEFAULT_NULLIFIER_SEED: number = 1234;
const statesList: string[] = [
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
const CONTRACT_ADDRESS: string = "0x7d444078768BbdBdB42Fb0F001d5d7B3EF3871f0";

// Interfaces for API responses
interface CheckResponse {
  success: boolean;
  message: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    kycHash: string;
    walletAddress: string;
    state: string;
  };
}

// Interface for proof data
interface ProofData {
  nullifier?: string;
  nullifierHash?: string;
  nullifier_hash?: string;
  id?: string;
  pcd?: string;
  proof?: {
    nullifier?: string;
  };
}

// QR Scanner Component Props
interface SimpleQRScannerProps {
  onNullifierReady: (nullifierValue: string, seedValue: number) => void;
}

// QR Scanner Component
const SimpleQRScanner: React.FC<SimpleQRScannerProps> = ({ onNullifierReady }) => {
  const [anonAadhaar] = useAnonAadhaar();
  const [nullifierId, setNullifierId] = useState<string | null>(null);

  // Get or initialize the nullifier seed from localStorage
  const [nullifierSeed] = useState<number>(() => {
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
    const keysToRemove: string[] = [];
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
      const getProof = (): ProofData | null => {
        if (anonAadhaar.anonAadhaarProof) return anonAadhaar.anonAadhaarProof as ProofData;
        if (anonAadhaar.proof) return anonAadhaar.proof as ProofData;
        if (anonAadhaar.anonAadhaarProofs) {
          return Array.isArray(anonAadhaar.anonAadhaarProofs)
            ? anonAadhaar.anonAadhaarProofs[0] as ProofData
            : anonAadhaar.anonAadhaarProofs as ProofData;
        }
        return null;
      };

      const proof = getProof();
      if (proof) {
        let nullifier: string | null = null;
        if (proof["0"] && proof["0"].pcd) {
          try {
            const pcdData: { proof?: { nullifier?: string } } = JSON.parse(proof["0"].pcd);
            nullifier = pcdData.proof?.nullifier || null;
          } catch {
            // Silent catch
          }
        }
        if (!nullifier) {
          nullifier = proof.nullifier ||
                     proof.nullifierHash ||
                     proof.nullifier_hash ||
                     proof.id ||
                     null;
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
  const handleScanAgain = (): void => {
    setNullifierId(null);
    onNullifierReady('', nullifierSeed);
    const seed = localStorage.getItem('anon-aadhaar-nullifier-seed');
    sessionStorage.clear();
    const keysToRemove: string[] = [];
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
    <div className="p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-cyan-600/30 hover:border-sky-400/60 transition-all duration-300 mb-6">
      <h3 className="text-xl font-bold text-cyan-100 mb-4">Scan Your Aadhaar QR Code</h3>
      <div className="mb-4 p-4 bg-slate-900/50 rounded-xl border border-cyan-600/30">
        <div className="flex items-center mb-2">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            anonAadhaar.status === "logged-in" ? "bg-green-500" :
            anonAadhaar.status === "loading" ? "bg-yellow-500 animate-pulse" : "bg-red-500"
          }`}></div>
          <span className="text-gray-300 text-sm">
            Status: {anonAadhaar.status === "logged-in" ? "Connected" :
                    anonAadhaar.status === "loading" ? "Connecting..." :
                    anonAadhaar.status === "logged-out" ? "Ready to Connect" : "Disconnected"}
          </span>
        </div>
        <div className="text-xs text-gray-400">App ID: {APP_ID.substring(0, 10)}...{APP_ID.substring(APP_ID.length - 5)}</div>
      </div>
      {anonAadhaar.status === "loading" && (
        <div className="flex justify-center py-6">
          <div className="animate-spin h-6 w-6 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
          <p className="text-yellow-400 ml-3">Connecting to scanner...</p>
        </div>
      )}
      {anonAadhaar.status !== "logged-in" && (
        <div className="flex flex-col items-center">
          <p className="text-gray-300 mb-4">Click the button below to scan your Aadhaar QR code</p>
          <div className="w-full">
            <LogInWithAnonAadhaar
              nullifierSeed={nullifierSeed}
              locale="en"
              styles={{
                button: {
                  background: 'linear-gradient(to right, #0891b2, #0ea5e9)',
                  border: 'none',
                  color: 'white',
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease-in-out',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
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
          <div className="p-4 bg-green-900/25 border border-green-500 rounded-xl text-green-300 mb-4">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">QR Scan Successful!</span>
            </div>
            <p className="text-sm mb-2">Your nullifier hash:</p>
            <div className="relative bg-slate-900/50 p-3 rounded-xl font-mono text-sm break-all min-h-[80px] border border-cyan-600/30">
              <div className="py-2 text-cyan-100">{nullifierId}</div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleScanAgain}
              className="px-4 py-2 font-bold text-cyan-100 rounded-xl transition-all border border-cyan-600/25 hover:border-sky-400/60 bg-slate-900/20 hover:bg-slate-900/30"
            >
              Scan Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Register Component
const Register: React.FC = () => {
  const [nullifier, setNullifier] = useState<string>('');
  const [nullifierSeed, setNullifierSeed] = useState<number | null>(null);
  const [checkResponse, setCheckResponse] = useState<CheckResponse | null>(null);
  const [state, setState] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [registerResponse, setRegisterResponse] = useState<RegisterResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [contract, setContract] = useState<Contract | null>(null);

  // Handler for nullifier update from QR scanner
  const handleNullifierReady = (nullifierValue: string, seedValue: number): void => {
    setNullifier(nullifierValue);
    setNullifierSeed(seedValue);
  };

  const checkNullifier = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${BD_PORT}/auth/check-nullifier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nullifier }),
      });
      const data: CheckResponse = await response.json();
      setCheckResponse(data);
    } catch (error) {
      console.error('Error checking nullifier:', error);
      setCheckResponse({ success: false, message: 'Error connecting to server' });
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async (): Promise<string | null> => {
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

  const storeNullifierOnChain = async (): Promise<string | null> => {
    if (!contract) {
      try {
        await connectWallet();
      } catch (error) {
        alert((error as Error).message);
        return null;
      }
    }
    try {
      setLoading(true);
      const tx = await contract!.storeNullifier(nullifier);
      await tx.wait();
      setTxHash(tx.hash);
      return tx.hash;
    } catch (error) {
      console.error('Error storing nullifier on chain:', error);
      alert(`Error: ${(error as Error).message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (): Promise<void> => {
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
      const data: RegisterResponse = await response.json();
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
      className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 left-0 w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-600/20 via-sky-500/15 to-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-700/15 via-sky-600/15 to-blue-500/10 blur-3xl" />
      </div>
      <div className="relative w-full max-w-4xl z-10 p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-500 flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(56,189,248,0.9)] rounded-md transform hover:scale-110 transition-transform duration-500">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-300 via-cyan-200 to-blue-200 drop-shadow-[0_0_10px_rgba(56,189,248,0.45)]">
            Voice-Vote Register
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mt-2">
            Complete your registration in three simple steps to access our decentralized platform
          </p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-cyan-600/30 hover:border-sky-400/60 transition-all duration-300 hover:shadow-[0_0_25px_-8px_rgba(56,189,248,0.35)] space-y-8">
          {/* Step 1: Scan Aadhaar QR and Get Nullifier */}
          <div>
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-cyan-600 to-sky-500 text-white rounded-full font-bold text-lg mr-4">
                1
              </div>
              <h2 className="text-2xl font-bold text-cyan-100">Scan Aadhaar QR Code</h2>
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
                  className="w-full py-3 font-bold text-cyan-100 rounded-xl transition-all border border-cyan-600/25 hover:border-sky-400/60 bg-slate-900/20 hover:bg-slate-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex justify-center items-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-cyan-100 border-t-transparent rounded-full"></div>
                      Submitting...
                    </span>
                  ) : 'Verify Nullifier'}
                </button>
              )}
              {checkResponse && (
                <div className={`p-4 rounded-xl border ${checkResponse.success ? 'bg-green-900/25 border-green-500 text-green-300' : 'bg-red-900/25 border-red-500 text-red-300'} animate-fade-in`}>
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
                    <span>{checkResponse.message}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Step 2: Store on Chain */}
          {checkResponse?.success && (
            <div>
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-cyan-600 to-sky-500 text-white rounded-full font-bold text-lg mr-4">
                  2
                </div>
                <h2 className="text-2xl font-bold text-cyan-100">Store Nullifier on 0G Mainnet</h2>
              </div>
              {!walletAddress ? (
                <button
                  onClick={connectWallet}
                  className="w-full py-3 font-bold text-cyan-100 rounded-xl transition-all border border-cyan-600/25 hover:border-sky-400/60 bg-slate-900/20 hover:bg-slate-900/30"
                >
                  <svg className="w-5 h-5 inline mr-2 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  Connect Wallet
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-cyan-600/30">
                    <p className="text-gray-300 text-sm mb-1">Connected Wallet:</p>
                    <p className="text-cyan-100 font-mono text-sm break-all">{walletAddress}</p>
                  </div>
                  <button
                    onClick={storeNullifierOnChain}
                    disabled={!!txHash || loading}
                    className="w-full py-3 font-bold text-cyan-100 rounded-xl transition-all border border-cyan-600/25 hover:border-sky-400/60 bg-slate-900/20 hover:bg-slate-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex justify-center items-center gap-2">
                        <div className="animate-spin h-5 w-5 border-2 border-cyan-100 border-t-transparent rounded-full"></div>
                        Processing...
                      </span>
                    ) : txHash ? (
                      <>
                        <svg className="w-5 h-5 inline mr-2 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Stored Successfully
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 inline mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Store on Blockchain
                      </>
                    )}
                  </button>
                </div>
              )}
              {txHash && (
                <div className="mt-4 p-4 bg-green-900/25 border border-green-500 rounded-xl animate-fade-in">
                  <div className="flex items-center text-green-300 mb-2">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Transaction Successful!</span>
                  </div>
                  <a
                    href={`https://chainscan.0g.ai/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-cyan-300 hover:text-sky-300 text-sm transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View on Explorer
                  </a>
                </div>
              )}
            </div>
          )}
          {/* Step 3: Registration */}
          {txHash && (
            <div>
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-cyan-600 to-sky-500 text-white rounded-full font-bold text-lg mr-4">
                  3
                </div>
                <h2 className="text-2xl font-bold text-cyan-100">Complete Registration</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block mb-1 text-sm font-medium text-cyan-200">
                    Select your State/Union Territory
                  </label>
                  <div className="relative">
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-cyan-600/30 text-cyan-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition appearance-none"
                    >
                      <option value="">Choose your state...</option>
                      {statesList.map((s) => (
                        <option key={s} value={s} className="py-2">{s}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-cyan-200">
                    Create Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a secure password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-cyan-600/30 text-cyan-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <button
                  onClick={registerUser}
                  disabled={loading || !state || !password}
                  className="w-full py-3 font-bold text-cyan-100 rounded-xl transition-all border border-cyan-600/25 hover:border-sky-400/60 bg-slate-900/20 hover:bg-slate-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex justify-center items-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-cyan-100 border-t-transparent rounded-full"></div>
                      Registering...
                    </span>
                  ) : (
                    <>
                      <svg className="w-5 h-5 inline mr-2 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Complete Registration
                    </>
                  )}
                </button>
                {registerResponse && (
                  <div className={`p-4 rounded-xl border ${registerResponse.success ? 'bg-green-900/25 border-green-500' : 'bg-red-900/25 border-red-500'} animate-fade-in`}>
                    {registerResponse.success ? (
                      <div className="text-green-300">
                        <div className="flex items-center mb-4">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-lg font-semibold">Registration Successful!</span>
                        </div>
                        {registerResponse.user && (
                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="text-gray-400">User ID:</span>
                                <span className="ml-2 font-mono text-cyan-100">{registerResponse.user.id}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Username:</span>
                                <span className="ml-2 text-cyan-100">{registerResponse.user.username}</span>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-gray-400">KYC Hash:</span>
                                <span className="ml-2 font-mono text-xs text-cyan-100 break-all">{registerResponse.user.kycHash}</span>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-gray-400">Wallet Address:</span>
                                <span className="ml-2 font-mono text-xs text-cyan-100 break-all">{registerResponse.user.walletAddress}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">State:</span>
                                <span className="ml-2 text-cyan-100">{registerResponse.user.state}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="mt-4 p-3 bg-blue-900/25 border border-blue-500 rounded-xl">
                          <p className="text-cyan-300 text-sm">
                            🎉 Redirecting to login page in a moment...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-300">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{registerResponse.message}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Register;