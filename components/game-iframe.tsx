'use client';

import { useEffect, useState } from 'react';
import { getGameToken } from '@/lib/api';

interface GameIframeProps {
  authToken: string | null;
}

export function GameIframe({ authToken }: GameIframeProps) {
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authToken) {
      setError('Please connect your wallet to play');
      setLoading(false);
      return;
    }

    const loadGame = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get encrypted token from backend
        const { token } = await getGameToken(authToken);

        // Game configuration - these should be in environment variables
        const FRONT_APP_DOMAIN = process.env.NEXT_PUBLIC_GAME_FRONT_URL || 'https://client.crash.aviator.studio:81';
        const PROVIDER_ID = process.env.NEXT_PUBLIC_PROVIDER_ID || '';
        const CASINO_ID = process.env.NEXT_PUBLIC_CASINO_ID || 'casino1';
        const COUNTRY = process.env.NEXT_PUBLIC_COUNTRY || 'US';
        const GAME_ID = parseInt(process.env.NEXT_PUBLIC_GAME_ID || '1', 10);
        const LANGUAGE = process.env.NEXT_PUBLIC_GAME_LANGUAGE || 'en';
        const CURRENCY = process.env.NEXT_PUBLIC_GAME_CURRENCY || 'USD';
        const BACK_TO_HOME = process.env.NEXT_PUBLIC_BACK_TO_HOME || '';
        const FULLSCREEN = process.env.NEXT_PUBLIC_GAME_FULLSCREEN !== 'false';
        const CHAT = process.env.NEXT_PUBLIC_GAME_CHAT === 'true';
        const DEDUCT_FREE_BET = process.env.NEXT_PUBLIC_DEDUCT_FREE_BET === 'true';

        // Build query parameters
        const params = new URLSearchParams();
        params.append('token', token);
        params.append('providerId', PROVIDER_ID);
        params.append('gameId', GAME_ID.toString());
        params.append('casinoId', CASINO_ID);
        params.append('country', COUNTRY);
        params.append('language', LANGUAGE);
        params.append('currency', CURRENCY);

        if (BACK_TO_HOME) {
          params.append('backToHome', BACK_TO_HOME);
        }

        if (!FULLSCREEN) {
          params.append('fullscreen', 'false');
        }

        if (CHAT) {
          params.append('chat', 'true');
        }

        if (DEDUCT_FREE_BET) {
          params.append('deductFreeBet', 'true');
        }

        // Construct final URL
        const url = `${FRONT_APP_DOMAIN}?${params.toString()}`;
        setGameUrl(url);
      } catch (err) {
        console.error('Failed to load game:', err);
        setError(err instanceof Error ? err.message : 'Failed to load game');
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [authToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gray-100 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gray-100 dark:bg-gray-900 rounded-lg">
        <div className="text-center p-8">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please make sure you're connected with your wallet
          </p>
        </div>
      </div>
    );
  }

  if (!gameUrl) {
    return null;
  }

  return (
    <div className="w-full h-full min-h-[600px] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
      <iframe
        src={gameUrl}
        className="w-full h-full border-0"
        allow="clipboard-read https://crash.aviator.studio; clipboard-write https://crash.aviator.studio"
        title="Aviator Game"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
}



