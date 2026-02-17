export interface WalletLoginResponse {
  code: number;
  data: {
    token: string;
    data: {
      id: string;
      walletAddress: string;
      userName: string;
      createdBy: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface GameTokenResponse {
  token: string;
  success: boolean;
  gameFrontUrl?: string;
}

function getBaseUrl(): string {
  const url =
    typeof process.env.NEXT_PUBLIC_API_BASE_URL === 'string' &&
    process.env.NEXT_PUBLIC_API_BASE_URL.trim()
      ? process.env.NEXT_PUBLIC_API_BASE_URL.trim()
      : 'http://localhost:3003';
  return url.replace(/\/$/, '');
}

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

export async function getGameToken(
  authToken: string,
  providerID?: string
): Promise<GameTokenResponse> {
  const response = await fetch(`${getBaseUrl()}/api/game/get-token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(providerID ? { providerID } : {}),
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