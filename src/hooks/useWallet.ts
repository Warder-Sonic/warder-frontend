import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { SONIC_TESTNET } from '@/lib/contracts';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  isLoading: boolean;
  error: string | null;
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

  const hasMetaMask = typeof window !== 'undefined' && window.ethereum?.isMetaMask;

  useEffect(() => {
    checkExistingConnection();
    
    if (hasMetaMask) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [hasMetaMask]);

  const checkExistingConnection = async () => {
    if (!hasMetaMask) return;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts && accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        
        setWallet({
          isConnected: true,
          address: accounts[0],
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
    if (!hasMetaMask) {
      setWallet(prev => ({ 
        ...prev, 
        error: 'MetaMask not detected. Please install MetaMask.' 
      }));
      return;
    }

    setWallet(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please ensure your wallet is unlocked.');
      }
      
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

      if (chainId !== SONIC_TESTNET.chainId) {
        await switchToSonic();
      }

    } catch (error: any) {
      console.error('Connection error:', error);
      
      let errorMessage = 'Connection failed';
      if (error.code === 4001) {
        errorMessage = 'User rejected the connection request';
      } else if (error.code === -32002) {
        errorMessage = 'Connection request already pending. Please check your wallet.';
      } else if (error.message?.includes('User rejected')) {
        errorMessage = 'Connection was cancelled by user';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setWallet(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage
      }));
    }
  };

  const switchToSonic = async () => {
    if (!hasMetaMask) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SONIC_TESTNET.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
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
      checkExistingConnection();
    }
  };

  const handleChainChanged = async (chainIdHex: string) => {
    try {
      if (hasMetaMask) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const signer = await provider.getSigner();
        
        setWallet(prev => ({
          ...prev,
          provider,
          signer,
          chainId: Number(network.chainId),
        }));
      }
    } catch (error) {
      console.error('Error handling chain change:', error);
    }
  };

  const isOnSonicNetwork = wallet.chainId === SONIC_TESTNET.chainId;

  return {
    ...wallet,
    connectWallet,
    disconnectWallet,
    switchToSonic,
    isOnSonicNetwork,
    hasMetaMask,
  };
};