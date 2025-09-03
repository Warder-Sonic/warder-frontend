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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/claim/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          amount: cashbackData.balanceFormatted
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Claim request failed');
      }

      const result = await response.json();
      
      toast({
        title: "Claim Successful!",
        description: `Successfully claimed ${result.data.netAmount} S (after fee of ${result.data.feeAmount} S)`,
      });

      await fetchCashbackData();

    } catch (error: any) {
      console.error('Claim error:', error);
      
      let errorMessage = 'Claim failed';
      if (error.message) {
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