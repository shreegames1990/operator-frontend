import { useWeb3Modal } from '@web3modal/wagmi/react';

/**
 * Safe wrapper for useWeb3Modal
 * Web3Modal should always be initialized, but this provides a consistent interface
 */
export function useWeb3ModalSafe() {
  return useWeb3Modal();
}

