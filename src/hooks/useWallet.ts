// useWallet.ts - Version modifiée
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
  walletType: string | null;
  showWalletSelection: boolean; // NOUVEAU: pour afficher la sélection
}

interface WalletInfo {
  name: string;
  provider: any;
  icon?: string;
}

declare global {
  interface Window {
    ethereum?: any;
    okxwallet?: any;
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
    walletType: null,
    showWalletSelection: false, // NOUVEAU
  });

  // Detect available wallets
  const getAvailableWallets = (): WalletInfo[] => {
    const wallets: WalletInfo[] = [];
    
    if (window.ethereum) {
      if (window.ethereum.isMetaMask && !window.ethereum.isRabby) {
        wallets.push({ 
          name: 'MetaMask', 
          provider: window.ethereum,
          icon: '🦊'
        });
      }
      if (window.ethereum.isRabby) {
        wallets.push({ 
          name: 'Rabby', 
          provider: window.ethereum,
          icon: '🐰'
        });
      }
      
      // Handle multiple providers
      if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
        window.ethereum.providers.forEach((provider: any) => {
          if (provider.isMetaMask && !provider.isRabby && !wallets.find(w => w.name === 'MetaMask')) {
            wallets.push({ name: 'MetaMask', provider, icon: '🦊' });
          }
          if (provider.isRabby && !wallets.find(w => w.name === 'Rabby')) {
            wallets.push({ name: 'Rabby', provider, icon: '🐰' });
          }
        });
      }
    }
    
    if (window.okxwallet) {
      wallets.push({ 
        name: 'OKX', 
        provider: window.okxwallet,
        icon: '⚡'
      });
    }
    
    return wallets;
  };

  // Get wallet by name
  const getWalletByName = (walletName: string) => {
    const wallets = getAvailableWallets();
    return wallets.find(w => w.name === walletName);
  };

  // Check if already connected on mount
  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    const wallets = getAvailableWallets();
    
    // Check each wallet to see if any are already connected
    for (const walletInfo of wallets) {
      try {
        const provider = new ethers.BrowserProvider(walletInfo.provider);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
          setWallet(prev => ({
            ...prev,
            isConnected: true,
            address: accounts[0].address,
            provider,
            signer,
            chainId: Number(network.chainId),
            isLoading: false,
            error: null,
            walletType: walletInfo.name,
            showWalletSelection: false,
          }));
          
          // Setup event listeners
          setupWalletListeners(walletInfo.provider);
          return; // Exit after finding connected wallet
        }
      } catch (error) {
        console.error(`Error checking ${walletInfo.name} connection:`, error);
      }
    }
  };

  const setupWalletListeners = (provider: any) => {
    if (provider) {
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
    }
  };

  const removeWalletListeners = (provider: any) => {
    if (provider?.removeListener) {
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
    }
  };

  // MODIFIÉ: Nouvelle fonction pour initier la connexion
  const initiateConnection = async () => {
    const availableWallets = getAvailableWallets();
    
    if (availableWallets.length === 0) {
      setWallet(prev => ({ 
        ...prev, 
        error: 'No compatible wallet detected. Please install MetaMask, Rabby, or OKX wallet.',
        showWalletSelection: false 
      }));
      return;
    }
    
    if (availableWallets.length === 1) {
      // Si un seul wallet, se connecter directement
      await connectToWallet(availableWallets[0].name);
    } else {
      // Si plusieurs wallets, afficher la sélection
      setWallet(prev => ({ 
        ...prev, 
        showWalletSelection: true,
        error: null 
      }));
    }
  };

  // NOUVEAU: Connexion à un wallet spécifique
  const connectToWallet = async (walletName: string) => {
    const walletInfo = getWalletByName(walletName);
    if (!walletInfo) {
      setWallet(prev => ({ ...prev, error: `${walletName} wallet not found` }));
      return;
    }

    setWallet(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      showWalletSelection: false 
    }));

    try {
      // Request connection
      await walletInfo.provider.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(walletInfo.provider);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      setWallet(prev => ({
        ...prev,
        isConnected: true,
        address,
        provider,
        signer,
        chainId,
        isLoading: false,
        error: null,
        walletType: walletInfo.name,
        showWalletSelection: false,
      }));

      // Setup listeners
      setupWalletListeners(walletInfo.provider);

      // Switch to Sonic if not already
      if (chainId !== SONIC_TESTNET.chainId) {
        await switchToSonic();
      }

    } catch (error: any) {
      console.error('Connection error:', error);
      setWallet(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Connection failed',
        walletType: null,
        showWalletSelection: false,
      }));
    }
  };

  // MODIFIÉ: fonction pour fermer la sélection
  const cancelWalletSelection = () => {
    setWallet(prev => ({ 
      ...prev, 
      showWalletSelection: false,
      error: null 
    }));
  };

  const switchToSonic = async () => {
    if (!wallet.provider) return;

    try {
      const walletInfo = getWalletByName(wallet.walletType || '');
      if (!walletInfo) return;

      // Try to switch to Sonic testnet
      await walletInfo.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SONIC_TESTNET.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If chain doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          const walletInfo = getWalletByName(wallet.walletType || '');
          await walletInfo?.provider.request({
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
    // Remove listeners from current wallet
    if (wallet.walletType) {
      const walletInfo = getWalletByName(wallet.walletType);
      if (walletInfo) {
        removeWalletListeners(walletInfo.provider);
      }
    }

    setWallet({
      isConnected: false,
      address: null,
      provider: null,
      signer: null,
      chainId: null,
      isLoading: false,
      error: null,
      walletType: null,
      showWalletSelection: false,
    });
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      checkExistingConnection();
    }
  };

  const handleChainChanged = () => {
    // Refresh the page when chain changes to avoid issues
    window.location.reload();
  };

  const isOnSonicNetwork = wallet.chainId === SONIC_TESTNET.chainId;
  const availableWallets = getAvailableWallets();

  return {
    ...wallet,
    connectWallet: initiateConnection, // MODIFIÉ: nouvelle fonction
    connectToWallet, // NOUVEAU: connexion directe à un wallet
    cancelWalletSelection, // NOUVEAU: annuler sélection
    disconnectWallet,
    switchToSonic,
    isOnSonicNetwork,
    availableWallets,
    hasWallet: availableWallets.length > 0,
  };
};