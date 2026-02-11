'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { walletLogin } from '@/lib/api';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isConnected && address) {
      handleWalletLogin(address);
    }
  }, [mounted, isConnected, address]);

  const handleWalletLogin = async (walletAddress: string) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const response = await walletLogin(walletAddress);
      if (response.code === 200) {
        // Store token in localStorage or state management
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.data));
        console.log('Wallet login successful:', response.data);
      }
    } catch (error) {
      console.error('Wallet login error:', error);
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    open();
  };

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  if (!mounted) {
    return (
      <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-black dark:text-white">
                  Operator
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                disabled
                className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
              >
                Loading...
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      <div className="  mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-black dark:text-white">
                Operator
              </span>
            </Link>
          </div>

          {/* Wallet Connect Button */}
          <div className="flex items-center gap-4">
            {loginError && (
              <span className="text-sm text-red-500">{loginError}</span>
            )}
            {isConnected ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                {isLoading ? (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                  >
                    Connecting...
                  </button>
                ) : (
                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

