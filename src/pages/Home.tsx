import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Coffee, Pizza, Zap, Gift, TrendingUp, DollarSign, Target, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useCashback } from '@/hooks/useCashback';
import { useWallet } from '@/hooks/useWallet';
import { useTransactions, useWalletBalance } from '@/hooks/useWarderApi';

const recentPurchases = [
  { id: 1, item: 'Coffee', location: 'Campus Café', amount: 4.50, cashbackRate: 5.2, cashback: 0.23, boost: 0.05, icon: Coffee },
  { id: 2, item: 'Pizza Slice', location: 'Student Center', amount: 6.75, cashbackRate: 4.8, cashback: 0.32, boost: 0.02, icon: Pizza },
  { id: 3, item: 'Coffee', location: 'Library Café', amount: 3.25, cashbackRate: 6.1, cashback: 0.20, boost: 0.04, icon: Coffee },
  { id: 4, item: 'Sandwich', location: 'Food Court', amount: 8.90, cashbackRate: 3.5, cashback: 0.31, boost: 0.14, icon: Pizza },
  { id: 5, item: 'Energy Drink', location: 'Vending Machine', amount: 2.75, cashbackRate: 7.2, cashback: 0.20, boost: 0.00, icon: Coffee },
  { id: 6, item: 'Burger Combo', location: 'Student Union', amount: 12.50, cashbackRate: 4.2, cashback: 0.53, boost: 0.10, icon: Pizza },
  { id: 7, item: 'Smoothie', location: 'Juice Bar', amount: 6.25, cashbackRate: 5.8, cashback: 0.36, boost: 0.07, icon: Coffee },
];

export default function Home() {
  const [showBalance, setShowBalance] = useState(true);
  
  // Hooks Web3
  const { isConnected, isOnSonicNetwork, address } = useWallet();
  const { 
    balanceFormatted, 
    canClaim, 
    claimCashback, 
    isClaimPending, 
    estimatedFee, 
    estimatedNetAmount,
    feeRate,
    isLoading: isCashbackLoading,
    error: cashbackError
  } = useCashback();
  
  const { data: transactionsData } = useTransactions(1, 5, { user: address });
  const { data: walletBalance } = useWalletBalance(address);
  
  const userTransactions = transactionsData?.transactions || [];
  
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const weeklyEarnings = userTransactions
    .filter(tx => tx.processed && new Date(tx.processedAt) >= weekAgo)
    .reduce((sum, tx) => sum + parseFloat(tx.cashbackAmount || '0'), 0);
    
  const monthlyEarnings = userTransactions
    .filter(tx => tx.processed && new Date(tx.processedAt) >= monthAgo)
    .reduce((sum, tx) => sum + parseFloat(tx.cashbackAmount || '0'), 0);
  
  const displayBalance = isConnected && isOnSonicNetwork 
    ? parseFloat(balanceFormatted) 
    : parseFloat(walletBalance?.cashbackBalance || '0');

  return (
    <div className="p-4 space-y-6">
      {/* Cashback Hero Section */}
      <Card className="bg-gradient-sonic-primary p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <DollarSign className="w-32 h-32" />
        </div>
        <div className="relative space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">Cashback Dashboard</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/80 text-sm">This Week Earned</p>
              <p className="text-2xl font-bold text-white">+{weeklyEarnings.toFixed(2)} S</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">This Month Earned</p>
              <p className="text-2xl font-bold text-white">+{monthlyEarnings.toFixed(2)} S</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-white/80 text-sm">Average Cashback Rate</p>
            <p className="text-3xl font-bold text-white">4.8%</p>
          </div>
        </div>
      </Card>

      {/* Main Balance Card - MODIFIÉE */}
      <Card className="bg-gradient-sonic-primary p-6 text-white">
        <div className="space-y-6">
          {/* Balance Section */}
          <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-medium mb-2" style={{ color: '#02283C' }}>
              {isConnected && isOnSonicNetwork ? 'Live Balance' : 'Total Balance'}
            </p>
            <div className="flex items-center gap-3">
                {isCashbackLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <p className="text-2xl font-bold">Loading...</p>
                  </div>
                ) : (
                  <p className="text-4xl font-bold">
                    {showBalance 
                      ? displayBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                      : '****.**'
                    }
                  </p>
                )}
                <button 
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-white/80 hover:text-white transition-smooth"
                >
                  {showBalance ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
                </button>
              </div>
              
              {/* Status indicator */}
              {isConnected && isOnSonicNetwork && (
                <div className="mt-2">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                    🔗 Live from Contract
                  </Badge>
                </div>
              )}
              {cashbackError && (
                <div className="mt-2">
                  <Badge variant="destructive" className="text-xs">
                    Error: {cashbackError}
                  </Badge>
                </div>
              )}
            </div>
            <div className="bg-secondary/20 rounded-2xl p-3">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <p className="text-white/80 text-xs mt-1 text-center">Tokens</p>
            </div>
          </div>

        {/* Earnings Stats */}
        <div className="flex justify-between">
          <div className="text-center">
            <p className="text-sm" style={{ color: '#02283C' }}>This Week</p>
            <p className="text-white font-bold text-lg">+{weeklyEarnings.toFixed(2)} S</p>
          </div>
          <div className="text-center">
            <p className="text-sm" style={{ color: '#02283C' }}>This Month</p>
            <p className="text-white font-bold text-lg">+{monthlyEarnings.toFixed(2)} S</p>
          </div>
        </div>
        </div>
    </Card>

    {/* Claim Cashback Section - MODIFIÉE */}
    <Card className="bg-gradient-sonic-primary p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Ready to Claim</h3>
        </div>
        
        {isConnected && isOnSonicNetwork ? (
          // Vraies données du contrat
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white">
              <span>Available Balance:</span>
              <span>{balanceFormatted} S</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Platform Fee ({(feeRate / 100)}%):</span>
              <span>-{estimatedFee} S</span>
            </div>
            <div className="border-t border-white/20 pt-2"></div>
            <div className="flex justify-between text-white font-bold text-lg">
              <span>Net Claimable:</span>
              <span>{estimatedNetAmount} S</span>
            </div>
          </div>
        ) : (
          // Données mockées quand pas connecté
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white">
              <span>Gross Cashback:</span>
              <span>+{(recentPurchases.reduce((total, purchase) => total + purchase.cashback, 0)).toFixed(2)} S</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Platform Fee (2%):</span>
              <span>-{(recentPurchases.reduce((total, purchase) => total + purchase.cashback, 0) * 0.02).toFixed(2)} S</span>
            </div>
            <div className="flex justify-between text-white">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Boost Bonus:
              </span>
              <span>+{(recentPurchases.reduce((total, purchase) => total + purchase.boost, 0)).toFixed(2)} S</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span>Fee-funded Bonus:</span>
              <span>+0.12 S</span>
            </div>
            <div className="border-t border-white/20 pt-2"></div>
            <div className="flex justify-between text-white font-bold text-lg">
              <span>Net Claimable:</span>
              <span>{(recentPurchases.reduce((total, purchase) => total + purchase.cashback + purchase.boost, 0) - (recentPurchases.reduce((total, purchase) => total + purchase.cashback, 0) * 0.02) + 0.12).toFixed(2)} S</span>
            </div>
          </div>
        )}
        
        <div className="flex gap-3 mt-6">
          <Button 
            className="flex-1 bg-white text-blue-900 hover:bg-white/90 font-semibold"
            onClick={claimCashback}
            disabled={isClaimPending || !canClaim || !isConnected || !isOnSonicNetwork}
          >
            {isClaimPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Claiming...
              </>
            ) : (
              "🚀 Claim on Sonic"
            )}
          </Button>
          <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
            💱 Instant Cashout
          </Button>
        </div>
        
        {/* Status messages */}
        {!isConnected && (
          <div className="text-center text-white/70 text-sm mt-2">
            Connect your wallet to claim cashback
          </div>
        )}
        {isConnected && !isOnSonicNetwork && (
          <div className="text-center text-orange-300 text-sm mt-2">
            Switch to Sonic network to claim
          </div>
        )}
        {isConnected && isOnSonicNetwork && !canClaim && (
          <div className="text-center text-white/70 text-sm mt-2">
            Minimum claim amount not reached
          </div>
        )}
      </div>
    </Card>

      {/* Cashback Insights */}
      <Card className="bg-gradient-sonic-primary p-6 text-white">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Cashback Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <p className="text-3xl font-bold text-green-400">{userTransactions.length}</p>
              <p className="text-xs text-white/80">total transactions</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <p className="text-3xl font-bold text-blue-400">{(userTransactions.reduce((sum, tx) => sum + parseFloat(tx.cashbackRate || '0'), 0) / Math.max(userTransactions.length, 1) * 100).toFixed(1)}%</p>
              <p className="text-xs text-white/80">avg rate</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-white text-sm">💡 <span className="font-semibold">Pro Tip:</span> Shop at Sonic Swap for 5.2% cashback this week!</p>
          </div>
        </div>
      </Card>

      {/* Recent Purchases */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Recent Purchases</h2>
        
        {userTransactions.map((tx) => (
          <Card key={tx.hash} className="bg-gradient-sonic-primary p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
               <div>
                 <div className="flex items-center gap-2">
                   <p className="font-medium" style={{ color: '#02283C' }}>{tx.dexName}</p>
                   <Badge className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                     {(parseFloat(tx.cashbackRate) * 100).toFixed(1)}%
                   </Badge>
                   {tx.processed && (
                     <div className="flex items-center gap-1">
                       <TrendingUp className="w-3 h-3 text-green-400" />
                     </div>
                   )}
                 </div>
                 <p className="text-sm" style={{ color: '#02283C', opacity: 0.7 }}>Block #{tx.blockNumber}</p>
               </div>
             </div>
             
             <div className="text-right">
               <p className="font-medium text-white">{parseFloat(tx.value / 1e18 || '0').toFixed(4)} S</p>
               <div className="flex flex-col gap-1">
                 <Badge className={`text-xs font-semibold border-0 ${
                   tx.processed ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                 }`}>
                   {tx.processed ? '✓' : '⏳'} {parseFloat(tx.cashbackAmount).toFixed(4)} S
                 </Badge>
               </div>
             </div>
           </div>
         </Card>
        ))}
        
        {recentPurchases.map((purchase) => (
          <Card key={purchase.id} className="bg-gradient-sonic-primary p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <purchase.icon className="w-5 h-5 text-white" />
                </div>
               <div>
                 <div className="flex items-center gap-2">
                   <p className="font-medium" style={{ color: '#02283C' }}>{purchase.item}</p>
                   <Badge className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                     {purchase.cashbackRate}%
                   </Badge>
                   {purchase.boost > 0 && (
                     <div className="flex items-center gap-1">
                       <Zap className="w-3 h-3 text-yellow-400" />
                       <TrendingUp className="w-3 h-3 text-yellow-400" />
                     </div>
                   )}
                 </div>
                 <p className="text-sm" style={{ color: '#02283C', opacity: 0.7 }}>{purchase.location}</p>
               </div>
             </div>
             
             <div className="text-right">
               <p className="font-medium text-white">${purchase.amount.toFixed(2)}</p>
               <div className="flex flex-col gap-1">
                 <Badge className="text-xs text-white font-semibold border-0 bg-secondary">
                   +{purchase.cashback.toFixed(2)} S
                 </Badge>
                 {purchase.boost > 0 && (
                   <Badge className="text-xs text-yellow-300 font-semibold border-0 bg-yellow-500/20">
                     +{purchase.boost.toFixed(2)} S boost
                   </Badge>
                 )}
               </div>
             </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}