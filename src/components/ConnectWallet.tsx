import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, AlertCircle, Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

export const ConnectWallet = () => {
  const {
    isConnected,
    address,
    chainId,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    switchToSonic,
    isOnSonicNetwork,
    hasMetaMask,
  } = useWallet();

  if (!isConnected) {
    return (
      <Card className="bg-gradient-sonic-primary p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-white">Connect MetaMask</p>
              <p className="text-sm text-white/70">
                {hasMetaMask ? 'Connect to claim your cashback' : 'Install MetaMask to continue'}
              </p>
            </div>
          </div>
          
          <Button
            onClick={connectWallet}
            disabled={isLoading || !hasMetaMask}
            className="bg-white text-blue-900 hover:bg-white/90"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : hasMetaMask ? (
              'Connect'
            ) : (
              'Install MetaMask'
            )}
          </Button>
        </div>
        
        {!hasMetaMask && (
          <div className="mt-3 p-3 bg-orange-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-orange-200">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">
                MetaMask not detected. 
                <a 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 underline"
                >
                  Install MetaMask
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

  return (
    <Card className="bg-gradient-sonic-primary p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="font-medium text-white">MetaMask Connected</p>
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