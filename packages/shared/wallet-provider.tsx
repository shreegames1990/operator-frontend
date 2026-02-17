'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { walletConnect, injected } from 'wagmi/connectors';
import { useEffect, useState, useMemo, useRef } from 'react';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

const metadata = {
  name: 'Operator',
  description: 'Operator Application',
  url:
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, ''),
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

// Create config with proper connectors
const createWagmiConfig = () => {
  // Build connectors array conditionally
  const connectors = projectId
    ? [
        walletConnect({ projectId, metadata, showQrModal: true }),
        injected({ shimDisconnect: true }),
      ]
    : [injected({ shimDisconnect: true })];

  return createConfig({
    chains: [mainnet, sepolia],
    connectors,
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  });
};

const queryClient = new QueryClient();
let web3ModalInitialized = false;
let wagmiConfigForModal: ReturnType<typeof createWagmiConfig> | null = null;

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Initialize Web3Modal only on client side
  useEffect(() => {
    if (typeof window !== 'undefined' && !web3ModalInitialized) {
      try {
        wagmiConfigForModal = createWagmiConfig();
        // Use projectId if available, otherwise use a placeholder (modal will still work for injected wallets)
        const modalProjectId = projectId || '00000000000000000000000000000000';
        createWeb3Modal({
          wagmiConfig: wagmiConfigForModal,
          projectId: modalProjectId,
          enableAnalytics: false,
        });
        web3ModalInitialized = true;
        
        if (!projectId) {
          console.warn(
            'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect wallets will not be available. ' +
            'Get a project ID at https://cloud.walletconnect.com. Injected wallets will still work.'
          );
        }
      } catch (error) {
        console.error('Failed to initialize Web3Modal:', error);
      }
    }
    setMounted(true);
  }, []);

  // Don't render WagmiProvider during SSR to avoid indexedDB access
  if (!mounted) {
    return <>{children}</>;
  }

  const config = wagmiConfigForModal || createWagmiConfig();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

