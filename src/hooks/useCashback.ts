import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { CONTRACTS, WARDER_WALLET_ABI, FEE_MANAGER_ABI } from '@/lib/contracts';
import { useToast } from './use-toast';

interface CashbackData {
  balance: string;
  balanceFormatted: string;
  canClaim: boolean;
  minimumClaimAmount: string;
  feeRate: number;
  estimatedFee: string;
  estimatedNetAmount: string;
  isLoading: boolean;
  error: string | null;
}

export const useCashback = () => {
  const { provider, signer, address, isConnected, isOnSonicNetwork } = useWallet();
  const { toast } = useToast();
  const [cashbackData, setCashbackData] = useState<CashbackData>({
    balance: '0',
    balanceFormatted: '0.00',
    canClaim: false,
    minimumClaimAmount: '0',
    feeRate: 0,
    estimatedFee: '0',
    estimatedNetAmount: '0',
    isLoading: false,
    error: null,
  });
  const [isClaimPending, setIsClaimPending] = useState(false);

  // Create contract instance
  const getContract = () => {
    if (!provider || !isConnected || !isOnSonicNetwork) return null;
    return new ethers.Contract(CONTRACTS.WARDER_WALLET, WARDER_WALLET_ABI, provider);
  };

  // Fetch cashback data
  const fetchCashbackData = async () => {
    if (!address || !isConnected || !isOnSonicNetwork) {
      setCashbackData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setCashbackData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const balance = await contract.cashbackBalances(address);
      const balanceFormatted = ethers.formatEther(balance);

      const minimumClaimAmount = 0.1;
      const canClaimResult = parseFloat(balanceFormatted) >= minimumClaimAmount;
      
      const feeManager = new ethers.Contract(CONTRACTS.FEE_MANAGER, FEE_MANAGER_ABI, provider);
      let estimatedFee = '0';
      let estimatedNetAmount = balanceFormatted;
      let feeRatePercent = 0;
      
      if (canClaimResult && parseFloat(balanceFormatted) > 0) {
        try {
          const balanceWei = ethers.parseEther(balanceFormatted);
          const feeWei = await feeManager.calculateFee(balanceWei);
          estimatedFee = ethers.formatEther(feeWei);
          const netAmount = balanceWei - feeWei;
          estimatedNetAmount = ethers.formatEther(netAmount);
          feeRatePercent = parseFloat(estimatedFee) / parseFloat(balanceFormatted) * 100;
        } catch (feeError) {
          console.warn('Could not calculate fee:', feeError);
        }
      }

      setCashbackData({
        balance: balance.toString(),
        balanceFormatted,
        canClaim: canClaimResult,
        minimumClaimAmount: minimumClaimAmount.toString(),
        feeRate: feeRatePercent,
        estimatedFee,
        estimatedNetAmount,
        isLoading: false,
        error: null,
      });

    } catch (error: any) {
      console.error('Error fetching cashback data:', error);
      setCashbackData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch cashback data'
      }));
    }
  };

  const claimCashback = async () => {
    if (!address || !isConnected || !isOnSonicNetwork) {
      toast({
        title: "Connection Required",
        description: "Please connect your wallet and switch to Sonic network",
        variant: "destructive"
      });
      return;
    }

    if (!cashbackData.canClaim) {
      toast({
        title: "Cannot Claim",
        description: `Minimum claim amount is ${cashbackData.minimumClaimAmount} S`,
        variant: "destructive"
      });
      return;
    }

    setIsClaimPending(true);

    try {
      const feeManagerContract = new ethers.Contract(CONTRACTS.FEE_MANAGER, FEE_MANAGER_ABI, signer);
      
      const balanceWei = ethers.parseEther(cashbackData.balanceFormatted);
      const feeWei = await feeManagerContract.calculateFee(balanceWei);
      
      console.log('Claiming:', {
        amount: cashbackData.balanceFormatted,
        fee: ethers.formatEther(feeWei),
        userAddress: address,
        feeManagerAddress: CONTRACTS.FEE_MANAGER
      });
      
      const gasEstimate = await feeManagerContract.processClaim.estimateGas(address, balanceWei, { value: feeWei });
      const gasLimit = gasEstimate * 120n / 100n;

      console.log('Sending transaction with:', {
        gasLimit: gasLimit.toString(),
        value: ethers.formatEther(feeWei),
        to: CONTRACTS.FEE_MANAGER
      });

      const tx = await feeManagerContract.processClaim(address, balanceWei, { 
        value: feeWei, 
        gasLimit 
      });
      
      console.log('Transaction hash:', tx.hash);
      console.log('Transaction details:', {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value || '0'),
        gasLimit: tx.gasLimit?.toString(),
        gasPrice: tx.gasPrice?.toString()
      });
      
      toast({
        title: "Transaction Submitted",
        description: `Transaction hash: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`,
      });

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        const feeAmount = ethers.formatEther(feeWei);
        const netAmount = (parseFloat(cashbackData.balanceFormatted) - parseFloat(feeAmount)).toFixed(4);
        
        toast({
          title: "Claim Successful!",
          description: `Successfully claimed ${netAmount} S (after fee of ${feeAmount} S). Tx: ${tx.hash.slice(0, 10)}...`,
        });

        await fetchCashbackData();
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error: any) {
      console.error('Claim error:', error);
      
      let errorMessage = 'Claim transaction failed';
      
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds to pay transaction fee';
      } else if (error.message?.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Claim Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsClaimPending(false);
    }
  };

  // Auto-refresh data when wallet connects/changes
  useEffect(() => {
    if (isConnected && isOnSonicNetwork && address) {
      fetchCashbackData();
      
      // Set up periodic refresh
      const interval = setInterval(fetchCashbackData, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, isOnSonicNetwork, address]);

  return {
    ...cashbackData,
    claimCashback,
    isClaimPending,
    refreshData: fetchCashbackData,
  };
};