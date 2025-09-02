import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { SONIC_TESTNET } from '@/lib/contracts';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  isLoading: boolean;
  error: string | null;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    provider: null,
    signer: null,
    chainId: null,
    isLoading: false,
    error: null,
  });

  // Check if already connected on mount
  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      // Listen for chain changes
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        
        setWallet({
          isConnected: true,
          address: accounts[0].address,
          provider,
          signer,
          chainId: Number(network.chainId),
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setWallet(prev => ({ ...prev, error: 'MetaMask not detected' }));
      return;
    }

    setWallet(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request connection
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      setWallet({
        isConnected: true,
        address,
        provider,
        signer,
        chainId,
        isLoading: false,
        error: null,
      });

      // Switch to Sonic if not already
      if (chainId !== SONIC_TESTNET.chainId) {
        await switchToSonic();
      }

    } catch (error: any) {
      console.error('Connection error:', error);
      setWallet(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Connection failed' 
      }));
    }
  };

  const switchToSonic = async () => {
    if (!window.ethereum) return;

    try {
      // Try to switch to Sonic testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SONIC_TESTNET.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If chain doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${SONIC_TESTNET.chainId.toString(16)}`,
              chainName: SONIC_TESTNET.name,
              rpcUrls: [SONIC_TESTNET.rpcUrl],
              nativeCurrency: SONIC_TESTNET.nativeCurrency,
              blockExplorerUrls: [SONIC_TESTNET.blockExplorer],
            }],
          });
        } catch (addError) {
          console.error('Error adding Sonic network:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      provider: null,
      signer: null,
      chainId: null,
      isLoading: false,
      error: null,
    });
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      checkConnection();
    }
  };

  const handleChainChanged = () => {
    // Refresh the page when chain changes to avoid issues
    window.location.reload();
  };

  const isOnSonicNetwork = wallet.chainId === SONIC_TESTNET.chainId;

  return {
    ...wallet,
    connectWallet,
    disconnectWallet,
    switchToSonic,
    isOnSonicNetwork,
    hasMetaMask: !!window.ethereum,
  };
};