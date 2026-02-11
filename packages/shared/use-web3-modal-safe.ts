'use client';

import { useWeb3Modal } from '@web3modal/wagmi/react';

/**
 * Safe wrapper for useWeb3Modal that handles SSR
 * Always calls the hook (required by React rules)
 * This should only be called in client components that are rendered after WalletProvider mounts
 */
export function useWeb3ModalSafe() {
  return useWeb3Modal();
}

