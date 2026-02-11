import type {
  WalletLoginResponse,
  GameTokenResponse,
  UsersListResponse,
  Game,
  GamesListResponse,
  GameResponse,
  FileUploadResponse,
  Provider,
  ProvidersListResponse,
  ProviderResponse,
} from './types';

// Re-export types for convenience
export type { Game, Provider };

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
};

// Helper function to get full image URL from relative path
export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) return '';
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If relative path, prepend base URL
  const baseUrl = getBaseUrl();
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
};

export async function walletLogin(
  walletAddress: string,
  userName?: string
): Promise<WalletLoginResponse> {
  const response = await fetch(`${getBaseUrl()}/api/v1/users/walletLogin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
    },
    body: JSON.stringify({
      walletAddress,
      userName: userName || walletAddress,
      createdBy: 'wallet_login',
    }),
  });

  if (!response.ok) {
    throw new Error(`Wallet login failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getGameToken(authToken: string): Promise<GameTokenResponse> {
  const response = await fetch(`${getBaseUrl()}/api/game/get-token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please connect your wallet');
    }
    if (response.status === 400) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Token generation failed');
    }
    throw new Error(`Failed to get game token: ${response.statusText}`);
  }

  return response.json();
}

export async function getUsersList(
  authToken: string,
  page: number = 1,
  limit: number = 10
): Promise<UsersListResponse> {
  const response = await fetch(
    `${getBaseUrl()}/api/v1/users/list?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please connect your wallet');
    }
    if (response.status === 403) {
      throw new Error('Forbidden: Admin access required');
    }
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return response.json();
}

// Public API - Get all games
export async function getAllGames(): Promise<GamesListResponse> {
  const response = await fetch(`${getBaseUrl()}/api/games`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.statusText}`);
  }

  return response.json();
}

// Public API - Get single game by gameID
export async function getGameByID(gameID: string): Promise<GameResponse> {
  const response = await fetch(`${getBaseUrl()}/api/games/${gameID}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch game: ${response.statusText}`);
  }

  return response.json();
}

// Admin API - Get all games with pagination
export async function getGamesList(
  authToken: string,
  page: number = 1,
  limit: number = 10
): Promise<GamesListResponse> {
  const response = await fetch(
    `${getBaseUrl()}/api/games/all?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please connect your wallet');
    }
    if (response.status === 403) {
      throw new Error('Forbidden: Admin access required');
    }
    throw new Error(`Failed to fetch games: ${response.statusText}`);
  }

  return response.json();
}

// Admin API - Create game
export async function createGame(
  authToken: string,
  game: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>
): Promise<GameResponse> {
  const response = await fetch(`${getBaseUrl()}/api/games`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(game),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please connect your wallet');
    }
    if (response.status === 403) {
      throw new Error('Forbidden: Admin access required');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to create game: ${response.statusText}`);
  }

  return response.json();
}

// Admin API - Update game
export async function updateGame(
  authToken: string,
  gameID: string,
  updates: Partial<Omit<Game, 'id' | 'gameID' | 'createdAt' | 'updatedAt'>>
): Promise<GameResponse> {
  const response = await fetch(`${getBaseUrl()}/api/games/${gameID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please connect your wallet');
    }
    if (response.status === 403) {
      throw new Error('Forbidden: Admin access required');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to update game: ${response.statusText}`);
  }

  return response.json();
}

// Admin API - Delete game
export async function deleteGame(
  authToken: string,
  gameID: string
): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/api/games/${gameID}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please connect your wallet');
    }
    if (response.status === 403) {
      throw new Error('Forbidden: Admin access required');
    }
    throw new Error(`Failed to delete game: ${response.statusText}`);
  }
}

// Admin API - Upload file
export async function uploadFile(
  authToken: string,
  file: File
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${getBaseUrl()}/api/upload/file`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please connect your wallet');
    }
    if (response.status === 403) {
      throw new Error('Forbidden: Admin access required');
    }
    if (response.status === 413) {
      throw new Error('File too large: Maximum size is 10MB');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to upload file: ${response.statusText}`);
  }

  return response.json();
}

// Public API - Get all providers
export async function getAllProviders(): Promise<ProvidersListResponse> {
  const response = await fetch(`${getBaseUrl()}/api/providers`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch providers: ${response.statusText}`);
  }

  return response.json();
}

// Public API - Get single provider by providerID
export async function getProviderByID(providerID: string): Promise<ProviderResponse> {
  const response = await fetch(`${getBaseUrl()}/api/providers/${providerID}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Provider not found');
    }
    throw new Error(`Failed to fetch provider: ${response.statusText}`);
  }

  return response.json();
}

// Admin API - Create provider
export async function createProvider(
  authToken: string,
  provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ProviderResponse> {
  const response = await fetch(`${getBaseUrl()}/api/providers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(provider),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please connect your wallet');
    }
    if (response.status === 403) {
      throw new Error('Forbidden: Admin access required');
    }
    if (response.status === 400) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Validation error: Provider may already exist');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to create provider: ${response.statusText}`);
  }

  return response.json();
}

// Admin API - Update provider
export async function updateProvider(
  authToken: string,
  providerID: string,
  updates: Partial<Omit<Provider, 'id' | 'providerID' | 'createdAt' | 'updatedAt'>>
): Promise<ProviderResponse> {
  const response = await fetch(`${getBaseUrl()}/api/providers/${providerID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please connect your wallet');
    }
    if (response.status === 403) {
      throw new Error('Forbidden: Admin access required');
    }
    if (response.status === 404) {
      throw new Error('Provider not found');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to update provider: ${response.statusText}`);
  }

  return response.json();
}

// Admin API - Delete provider
export async function deleteProvider(
  authToken: string,
  providerID: string
): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/api/providers/${providerID}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please connect your wallet');
    }
    if (response.status === 403) {
      throw new Error('Forbidden: Admin access required');
    }
    if (response.status === 404) {
      throw new Error('Provider not found');
    }
    throw new Error(`Failed to delete provider: ${response.statusText}`);
  }
}

