'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameIframe } from '@/components/game-iframe';
import { getGameByID } from '@operator/shared/api';
import type { Game } from '@operator/shared/types';

function GamePageLoader() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

function GamePageContent() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [gameError, setGameError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('authToken');
    setAuthToken(token);
  }, []);

  useEffect(() => {
    if (!mounted || !gameId) return;
    let cancelled = false;
    getGameByID(gameId)
      .then((res) => {
        if (cancelled) return;
        const data = res.data ?? res.game;
        if (data) setGame(data);
        else setGameError('Game not found');
      })
      .catch((err) => {
        if (!cancelled) setGameError(err instanceof Error ? err.message : 'Failed to load game');
      });
    return () => {
      cancelled = true;
    };
  }, [mounted, gameId]);

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

  if (gameId && !game && !gameError) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  if (gameId && gameError) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <p className="text-red-500">{gameError}</p>
      </div>
    );
  }

  if (gameId && game && !game.gameFrontUrl) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <p className="text-zinc-500">Game not available at the moment.</p>
      </div>
    );
  }

  const gameIdFromGame = game?.gameID ?? (game as { gameId?: string })?.gameId;
  const gameMatchesUrl = game && gameIdFromGame === gameId;
  if (!gameMatchesUrl) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-zinc-950">
      <main className="w-full h-full">
        <GameIframe
          key={gameId}
          authToken={authToken}
          providerID={game.providerID ?? game.provider ?? undefined}
          gameFrontUrl={game.gameFrontUrl ?? undefined}
        />
      </main>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<GamePageLoader />}>
      <GamePageContent />
    </Suspense>
  );
}
