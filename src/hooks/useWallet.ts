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

  const getMetaMaskAvailability = () => {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           (window.ethereum.isMetaMask || window.ethereum._metamask);
  };

  const validateConnection = async (provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner, address: string) => {
    try {
      const currentAddress = await signer.getAddress();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(address);
      
      console.log('Connection validation:', {
        expectedAddress: address,
        currentAddress,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        isValid: currentAddress.toLowerCase() === address.toLowerCase()
      });
      
      return currentAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Connection validation failed:', error);
      return false;
    }
  };

  const hasMetaMask = getMetaMaskAvailability();

  useEffect(() => {
    console.log('Wallet initialization:', {
      hasWindow: typeof window !== 'undefined',
      hasEthereum: !!window?.ethereum,
      isMetaMask: window?.ethereum?.isMetaMask,
      hasMetaMask
    });
    
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
  }, []);

  useEffect(() => {
    if (!wallet.isConnected || !wallet.provider || !wallet.signer || !wallet.address) return;
    
    const validatePeriodically = setInterval(async () => {
      try {
        const isValid = await validateConnection(wallet.provider!, wallet.signer!, wallet.address!);
        if (!isValid) {
          console.log('Periodic validation failed, disconnecting');
          disconnectWallet();
        }
      } catch (error) {
        console.error('Periodic validation error:', error);
        disconnectWallet();
      }
    }, 10000);

    return () => clearInterval(validatePeriodically);
  }, [wallet.isConnected, wallet.provider, wallet.signer, wallet.address]);

  const checkExistingConnection = async () => {
    const metaMaskAvailable = getMetaMaskAvailability();
    console.log('checkExistingConnection called, hasMetaMask:', metaMaskAvailable);
    if (!metaMaskAvailable) {
      console.log('No MetaMask detected');
      return;
    }
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      console.log('Existing accounts:', accounts);
      
      if (accounts && accounts.length > 0) {
        console.log('Found existing connection, initializing...');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        
        const isValid = await validateConnection(provider, signer, accounts[0]);
        
        if (isValid) {
          console.log('Auto-connecting with validated connection:', {
            address: accounts[0],
            chainId: Number(network.chainId)
          });
          
          setWallet({
            isConnected: true,
            address: accounts[0],
            provider,
            signer,
            chainId: Number(network.chainId),
            isLoading: false,
            error: null,
          });
        } else {
          console.log('Connection validation failed, disconnecting');
          disconnectWallet();
        }
      } else {
        console.log('No existing accounts found');
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connectWallet = async () => {
    const metaMaskAvailable = getMetaMaskAvailability();
    console.log('connectWallet called, hasMetaMask:', metaMaskAvailable);
    
    if (!metaMaskAvailable) {
      setWallet(prev => ({ 
        ...prev, 
        error: 'MetaMask not detected. Please install MetaMask.' 
      }));
      return;
    }

    setWallet(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('Requesting accounts...');
      
      const accounts = await Promise.race([
        window.ethereum.request({ method: 'eth_requestAccounts' }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout - please try again')), 10000)
        )
      ]);
      
      console.log('Accounts received:', accounts);

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please ensure your wallet is unlocked.');
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      const isValid = await validateConnection(provider, signer, address);
      
      if (!isValid) {
        throw new Error('Connection validation failed. Please try again.');
      }

      console.log('Connected successfully with validation:', {
        address,
        chainId,
        isOnSonic: chainId === SONIC_TESTNET.chainId
      });

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
        console.log('Switching to Sonic network...');
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
    if (!getMetaMaskAvailability()) return;

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
    console.log('Chain changed to:', chainIdHex);
    try {
      if (getMetaMaskAvailability()) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        console.log('Chain change - updating wallet state:', {
          chainId: Number(network.chainId),
          address,
          isConnected: true
        });
        
        setWallet(prev => ({
          ...prev,
          provider,
          signer,
          address,
          chainId: Number(network.chainId),
          isConnected: true,
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