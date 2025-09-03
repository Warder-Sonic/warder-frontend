import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, AlertCircle, ExternalLink, Loader2, X } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

export const ConnectWallet = () => {
  const {
    isConnected,
    address,
    chainId,
    isLoading,
    error,
    connectWallet,
    connectToWallet,
    cancelWalletSelection,
    disconnectWallet,
    switchToSonic,
    isOnSonicNetwork,
    hasWallet,
    walletType,
    showWalletSelection,
    availableWallets,
  } = useWallet();

  // NOUVEAU: Composant de sélection de wallet
  if (showWalletSelection) {
    return (
      <Card className="bg-gradient-sonic-primary p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Choose Your Wallet</h3>
            <Button
              onClick={cancelWalletSelection}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid gap-3">
            {availableWallets.map((wallet) => (
              <Button
                key={wallet.name}
                onClick={() => connectToWallet(wallet.name)}
                disabled={isLoading}
                className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/20 justify-start gap-3 h-12"
              >
                <span className="text-lg">{wallet.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{wallet.name}</div>
                  <div className="text-xs text-white/70">
                    {wallet.name === 'MetaMask' && 'Most popular wallet'}
                    {wallet.name === 'Rabby' && 'Multi-chain wallet'}
                    {wallet.name === 'OKX' && 'Exchange wallet'}
                  </div>
                </div>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
              </Button>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-white/60">
              Don't have a wallet? Install one of the options above
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // If not connected, show connect button
  if (!isConnected) {
    return (
      <Card className="bg-gradient-sonic-primary p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-white">Connect Wallet</p>
              <p className="text-sm text-white/70">
                {hasWallet ? 'Connect to claim your cashback' : 'Install a wallet to continue'}
              </p>
            </div>
          </div>
          
          <Button
            onClick={connectWallet}
            disabled={isLoading || !hasWallet}
            className="bg-white text-blue-900 hover:bg-white/90"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : hasWallet ? (
              'Connect'
            ) : (
              'No Wallet'
            )}
          </Button>
        </div>
        
        {!hasWallet && (
          <div className="mt-3 p-3 bg-orange-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-orange-200">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">
                No wallet detected. Install 
                <a 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 underline"
                >
                  MetaMask
                </a>, 
                <a 
                  href="https://rabby.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 underline"
                >
                  Rabby
                </a>, or 
                <a 
                  href="https://www.okx.com/web3" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 underline"
                >
                  OKX Wallet
                </a>
              </p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-3 p-3 bg-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-200">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // If connected but wrong network
  if (isConnected && !isOnSonicNetwork) {
    return (
      <Card className="bg-gradient-sonic-primary p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-white">Wrong Network</p>
                <p className="text-sm text-white/70">
                  {address?.slice(0, 6)}...{address?.slice(-4)} 
                  {walletType && <span className="ml-1">({walletType})</span>}
                </p>
              </div>
            </div>
            
            <Badge variant="destructive" className="bg-orange-500/20 text-orange-300">
              Chain {chainId}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={switchToSonic}
              className="flex-1 bg-white text-blue-900 hover:bg-white/90"
            >
              Switch to Sonic
            </Button>
            <Button
              onClick={disconnectWallet}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Connected and on correct network
  return (
    <Card className="bg-gradient-sonic-primary p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="font-medium text-white">
              {walletType} Connected
            </p>
            <p className="text-sm text-white/70 font-mono">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            Sonic Testnet
          </Badge>
          <Button
            onClick={disconnectWallet}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Disconnect
          </Button>
        </div>
      </div>
    </Card>
  );
};