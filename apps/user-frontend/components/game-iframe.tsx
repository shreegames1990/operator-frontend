'use client';

import { useEffect, useState } from 'react';
import { getGameToken } from '@operator/shared/api';

interface GameIframeProps {
  authToken: string | null;
  providerID?: string | null;
  gameFrontUrl?: string | null;
}

export function GameIframe({ authToken, providerID, gameFrontUrl }: GameIframeProps) {
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

        const useGameContext = providerID && gameFrontUrl;
        const { token } = await getGameToken(
          authToken,
          useGameContext ? providerID : undefined
        );

        const baseUrl = useGameContext
          ? gameFrontUrl.replace(/\/$/, '')
          : (process.env.NEXT_PUBLIC_GAME_FRONT_URL || '').replace(/\/$/, '');
        const provId = useGameContext
          ? providerID
          : (process.env.NEXT_PUBLIC_PROVIDER_ID || '');

        if (!baseUrl || !provId) {
          setError('Game URL or provider not configured');
          return;
        }

        const CURRENCY = process.env.NEXT_PUBLIC_GAME_CURRENCY || 'USD';
        const LANGUAGE = process.env.NEXT_PUBLIC_GAME_LANGUAGE || 'en';
        const gameUrlBuilt = `${baseUrl}?token=${encodeURIComponent(
          token
        )}&providerId=${encodeURIComponent(provId)}&currency=${CURRENCY}&language=${LANGUAGE}`;
        setGameUrl(gameUrlBuilt);
      } catch (err) {
        console.error('Failed to load game:', err);
        setError(err instanceof Error ? err.message : 'Failed to load game');
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [authToken, providerID, gameFrontUrl]);

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
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 rounded-lg">
        <div className="text-center p-8">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please make sure you&apos;re connected with your wallet
          </p>
        </div>
      </div>
    );
  }

  if (!gameUrl) {
    return null;
  }

  const allowOrigin = (() => {
    try {
      return new URL(gameUrl).origin;
    } catch {
      return '';
    }
  })();
  const allowAttr = allowOrigin
    ? `clipboard-read ${allowOrigin}; clipboard-write ${allowOrigin}`
    : undefined;

  return (
    <div className="w-full h-full min-h-[900px] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
      <iframe
        src={gameUrl}
        className="w-full h-full border-0"
        allow={allowAttr}
        title="Game"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
}


