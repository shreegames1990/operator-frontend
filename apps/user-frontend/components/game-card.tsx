'use client';

import Link from 'next/link';
import type { Game } from '@operator/shared/types';
import { getImageUrl } from '@operator/shared/api';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const gamePath = `/game?gameId=${game.gameID}`;
  const imageUrl = getImageUrl(game.poster || game.logo);
  
  return (
    <Link href={gamePath} className="group cursor-pointer block">
      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={game.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </Link>
  );
}

