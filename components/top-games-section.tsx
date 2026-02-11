'use client';

import { useEffect, useState } from 'react';
import { GameCard } from './game-card';
import { getAllGames } from '../packages/shared/api';
import type { Game } from '../packages/shared/types';

function GameCardSkeleton() {
  return (
    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-800" />
    </div>
  );
}

export function TopGamesSection() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAllGames();
        // Handle both response formats: { code, data: { games } } or { games }
        const gamesList = response.data?.games || response.games || [];
        // Filter only active games
        const activeGames = gamesList.filter((game) => game.isActive);
        setGames(activeGames);
      } catch (err) {
        console.error('Failed to fetch games:', err);
        setError(err instanceof Error ? err.message : 'Failed to load games');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <section className="w-full py-12 bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-zinc-100">
          Top Games
        </h2>
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {isLoading ? (
            // Show 6 skeleton cards while loading
            Array.from({ length: 6 }).map((_, index) => (
              <GameCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : games.length > 0 ? (
            games.map((game) => (
              <GameCard key={game.gameID} game={game} />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-zinc-600 dark:text-zinc-400">
              No games available at the moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

