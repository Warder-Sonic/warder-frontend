import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Coins, Receipt, CheckCircle, AlertCircle, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransactions, useWalletBalance, useProcessClaim } from '@/hooks/useWarderApi';
import { useCashback } from '@/hooks/useCashback';
import { useWallet } from '@/hooks/useWallet';

const pendingClaims = [
  {
    id: 1,
    merchant: 'Campus Café',
    purchaseDate: '2024-01-15',
    amount: 4.50,
    grossCashback: 0.23,
    platformFee: 0.01,
    boost: 0.05,
    feeBonus: 0.02,
    netClaimable: 0.29,
    status: 'pending'
  },
  {
    id: 2,
    merchant: 'Sonic Swap DEX',
    purchaseDate: '2024-01-14',
    amount: 50.00,
    grossCashback: 2.60,
    platformFee: 0.05,
    boost: 0.15,
    feeBonus: 0.08,
    netClaimable: 2.78,
    status: 'pending'
  },
  {
    id: 3,
    merchant: 'Digital Marketplace',
    purchaseDate: '2024-01-13',
    amount: 25.99,
    grossCashback: 1.17,
    platformFee: 0.02,
    boost: 0.10,
    feeBonus: 0.04,
    netClaimable: 1.29,
    status: 'pending'
  }
];

const claimHistory = [
  {
    id: 4,
    merchant: 'Student Union Market',
    claimDate: '2024-01-12',
    txHash: '0x1a2b3c...',
    amount: 8.90,
    grossCashback: 0.31,
    platformFee: 0.01,
    boost: 0.14,
    feeBonus: 0.03,
    netClaimed: 0.47,
    status: 'claimed'
  },
  {
    id: 5,
    merchant: 'CloudStore',
    claimDate: '2024-01-10',
    txHash: '0x4d5e6f...',
    amount: 12.99,
    grossCashback: 0.94,
    platformFee: 0.02,
    boost: 0.00,
    feeBonus: 0.05,
    netClaimed: 0.97,
    status: 'claimed'
  },
  {
    id: 6,
    merchant: 'Tech Zone',
    claimDate: '2024-01-08',
    txHash: '0x7g8h9i...',
    amount: 89.99,
    grossCashback: 4.95,
    platformFee: 0.10,
    boost: 0.25,
    feeBonus: 0.12,
    netClaimed: 5.22,
    status: 'claimed'
  }
];

// Test wallet address
const TEST_WALLET_ADDRESS = '0x0e0A0a14ac1E9fa088BBDdCb925c47d0ba5Ccfa1';

export default function Activity() {
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [walletAddress] = useState(TEST_WALLET_ADDRESS);
  const { toast } = useToast();
  
  // Web3 hooks
  const { isConnected, isOnSonicNetwork, address } = useWallet();
  const { claimCashback, isClaimPending, balanceFormatted, canClaim } = useCashback();
  
  // API hooks
  const { data: transactionsData, isLoading: loadingTransactions } = useTransactions(1, 50, { 
    user: address || walletAddress,
    processed: undefined 
  });
  const { data: walletBalance, isLoading: loadingBalance } = useWalletBalance(address || walletAddress);
  const processClaim = useProcessClaim();
  
  // Separate transactions into pending and claimed
  const pendingTransactions = transactionsData?.transactions.filter(tx => !tx.processed && parseFloat(tx.cashbackAmount) > 0) || [];
  const claimedTransactions = transactionsData?.transactions.filter(tx => tx.processed) || [];
  
  const totalPending = pendingTransactions.reduce((sum, tx) => sum + parseFloat(tx.cashbackAmount), 0);
  const totalClaimed = claimedTransactions.reduce((sum, tx) => sum + parseFloat(tx.cashbackAmount), 0);

  const handleSingleClaim = async (claimId: any, amount?: string) => {
    if (isConnected && isOnSonicNetwork) {
      // Utiliser le vrai contrat Web3
      await claimCashback();
    } else {
      // Fallback sur l'API pour les tests
      try {
        const result = await processClaim.mutateAsync({ 
          userAddress: address || walletAddress, 
          amount: amount || '1'
        });
        
        toast({
          title: "Claim Successful!",
          description: `Claimed ${amount || '1'} S. Transaction: ${result.transactionHash.slice(0, 10)}...`,
        });
      } catch (error) {
        toast({
          title: "Claim Failed",
          description: "Failed to process claim. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleBatchClaim = async () => {
    if (isConnected && isOnSonicNetwork) {
      // Pour le batch claim via Web3, on fait un seul claim global
      await claimCashback();
      setSelectedClaims([]);
    } else {
      // Code existant pour l'API
      const selectedTxs = pendingTransactions.filter(tx => selectedClaims.includes(tx.hash));
      const totalAmount = selectedTxs.reduce((sum, tx) => sum + parseFloat(tx.cashbackAmount), 0).toFixed(4);
      
      try {
        const result = await processClaim.mutateAsync({ 
          userAddress: address || walletAddress, 
          amount: totalAmount 
        });
        
        toast({
          title: "Batch Claim Successful!",
          description: `Claimed ${totalAmount} S from ${selectedTxs.length} transactions`,
        });
        
        setSelectedClaims([]);
      } catch (error) {
        toast({
          title: "Batch Claim Failed",
          description: "Failed to process batch claim. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const toggleClaimSelection = (claimId: number) => {
    setSelectedClaims(prev => 
      prev.includes(claimId.toString()) 
        ? prev.filter(id => id !== claimId.toString())
        : [...prev, claimId.toString()]
    );
  };

  const ClaimCard = ({ claim, isPending = true }: { claim: any, isPending?: boolean }) => (
    <Card className="bg-gradient-sonic-primary p-5 text-white">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isPending && (
              <input
                type="checkbox"
                checked={selectedClaims.includes(claim.id.toString())}
                onChange={() => toggleClaimSelection(claim.id)}
                className="w-4 h-4 rounded"
              />
            )}
            <div>
              <h3 className="font-semibold text-white">{claim.merchant}</h3>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Calendar className="w-3 h-3" />
                <span>{isPending ? claim.purchaseDate : claim.claimDate}</span>
                {!isPending && (
                  <>
                    <Receipt className="w-3 h-3 ml-2" />
                    <span className="font-mono text-xs">{claim.txHash}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70">Purchase: ${claim.amount.toFixed(2)}</p>
            <Badge className={isPending 
              ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" 
              : "bg-green-500/20 text-green-300 border-green-500/30"
            }>
              {isPending ? 'Pending' : 'Claimed'}
            </Badge>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white/10 rounded-lg p-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Gross Cashback:</span>
            <span>+{claim.grossCashback.toFixed(2)} S</span>
          </div>
          <div className="flex justify-between text-white/80">
            <span>Platform Fee (2%):</span>
            <span>-{claim.platformFee.toFixed(2)} S</span>
          </div>
          {claim.boost > 0 && (
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Boost Bonus:
              </span>
              <span>+{claim.boost.toFixed(2)} S</span>
            </div>
          )}
          <div className="flex justify-between text-white/80">
            <span>Fee-funded Bonus:</span>
            <span>+{claim.feeBonus.toFixed(2)} S</span>
          </div>
          <div className="border-t border-white/20 pt-2 flex justify-between font-bold">
            <span>{isPending ? 'Net Claimable:' : 'Net Claimed:'}</span>
            <span>{isPending ? claim.netClaimable.toFixed(2) : claim.netClaimed.toFixed(2)} S</span>
          </div>
        </div>

        {isPending && (
          <Button 
            size="sm" 
            onClick={() => handleSingleClaim(claim.id, claim.netClaimable?.toString())}
            disabled={isClaimPending || (!isConnected && !canClaim)}
            className="w-full bg-white text-blue-900 hover:bg-white/90"
          >
            {isClaimPending ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <Coins className="w-3 h-3 mr-1" />
                Claim on Sonic
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 pt-4">
        <h1 className="text-2xl font-bold">Cashback Claims</h1>
        <p className="text-muted-foreground">Manage your cashback claims & history</p>
      </div>

      {/* Connection Status */}
      {isConnected && isOnSonicNetwork && (
        <Card className="bg-green-500/10 border-green-500/20 p-3">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Connected to Sonic - Live contract data</span>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-sonic-primary p-4 text-white">
          <div>
            <p className="text-sm text-white/80">Total Pending</p>
            <p className="font-bold text-2xl text-white">
              {isConnected && isOnSonicNetwork ? balanceFormatted : totalPending.toFixed(2)} S
            </p>
            <p className="text-xs text-white/60">{pendingClaims.length} claims</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-sonic-primary p-4 text-white">
          <div>
            <p className="text-sm text-white/80">Total Claimed</p>
            <p className="font-bold text-2xl text-white">{totalClaimed.toFixed(2)} S</p>
            <p className="text-xs text-white/60">{claimHistory.length} claims</p>
          </div>
        </Card>
      </div>

      {/* Batch Claim Button */}
      {selectedClaims.length > 0 && (
        <Card className="bg-gradient-sonic-primary p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">{selectedClaims.length} claims selected</p>
              <p className="text-white/70 text-sm">
                Total: {pendingClaims
                  .filter(claim => selectedClaims.includes(claim.id.toString()))
                  .reduce((sum, claim) => sum + claim.netClaimable, 0)
                  .toFixed(2)} S
              </p>
            </div>
            <Button 
              onClick={handleBatchClaim}
              disabled={isClaimPending}
              className="bg-white text-blue-900 hover:bg-white/90"
            >
              {isClaimPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                "🚀 Batch Claim on Sonic"
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            <AlertCircle className="w-4 h-4 mr-1" />
            Pending Claims
          </TabsTrigger>
          <TabsTrigger value="history">
            <CheckCircle className="w-4 h-4 mr-1" />
            Claim History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Pending Claims</h3>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                {pendingClaims.length} pending
              </Badge>
            </div>
            {pendingClaims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} isPending={true} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Claim History</h3>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                {claimHistory.length} claimed
              </Badge>
            </div>
            {claimHistory.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} isPending={false} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}