'use client';

import { useEffect, useState } from 'react';
import { GameIframe } from '@/components/game-iframe';

export default function GamePage() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('authToken');
    setAuthToken(token);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            Aviator Game
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Play the crash game and test your luck!
          </p>
        </div>
        <GameIframe authToken={authToken} />
      </main>
    </div>
  );
}


