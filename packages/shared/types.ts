export type UserType = 'ADMIN' | 'USER';

export interface UserData {
  id: string;
  walletAddress: string;
  userName: string;
  userType?: UserType;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletLoginResponse {
  code: number;
  data: {
    token: string;
    data: UserData;
  };
}

export interface GameTokenResponse {
  token: string;
  success: boolean;
  gameFrontUrl?: string;
}

export interface UsersListResponse {
  code: number;
  data: {
    users: UserData[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Game {
  id?: string;
  gameID: string;
  name: string;
  poster: string;
  logo: string;
  currency: string;
  minBet: number;
  maxBet: number;
  provider: string;
  providerID?: string;
  gameFrontUrl?: string | null;
  category: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GamesListResponse {
  code?: number;
  data?: {
    games: Game[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  games?: Game[];
}

export interface GameResponse {
  code?: number;
  data?: Game;
  game?: Game;
}

export interface FileUploadResponse {
  code: number;
  data: {
    url: string;
    filename: string;
    size: number;
    mimetype: string;
  };
}

export interface Provider {
  id?: string;
  providerID: string;
  name: string;
  logo?: string;
  gameFrontUrl?: string;
  active?: boolean;
  /** Only sent on create/update; never returned by API */
  publicKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProvidersListResponse {
  code: number;
  data: {
    providers: Provider[];
  };
}

export interface ProviderResponse {
  code: number;
  data: Provider;
}

