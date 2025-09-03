import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { CONTRACTS, WARDER_WALLET_ABI } from '@/lib/contracts';
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
  console.log("Frontend reading balance for address:", address);

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

      // Fetch all data in parallel
      const [
        balance,
        canClaim,
        minimumClaimAmount,
        feeRate,
        feeData
      ] = await Promise.all([
        contract.getUserBalance(address),
        contract.canClaim(address),
        contract.minimumClaimAmount(),
        contract.claimFeeRate(),
        contract.calculateClaimFee(address)
      ]);

      const balanceFormatted = ethers.formatEther(balance);
      const estimatedFee = ethers.formatEther(feeData[0]);
      const estimatedNetAmount = ethers.formatEther(feeData[1]);

      setCashbackData({
        balance: balance.toString(),
        balanceFormatted,
        canClaim,
        minimumClaimAmount: ethers.formatEther(minimumClaimAmount),
        feeRate: Number(feeRate),
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

  // Claim cashback
  const claimCashback = async () => {
    if (!signer || !address || !isConnected || !isOnSonicNetwork) {
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
      const contract = new ethers.Contract(CONTRACTS.WARDER_WALLET, WARDER_WALLET_ABI, signer);
      
      // Estimate gas
      const gasEstimate = await contract.claimCashback.estimateGas();
      const gasLimit = gasEstimate * 120n / 100n; // Add 20% buffer

      // Send transaction
      const tx = await contract.claimCashback({ gasLimit });
      
      toast({
        title: "Transaction Submitted",
        description: "Your claim transaction has been submitted to the network",
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast({
          title: "Claim Successful!",
          description: `Successfully claimed ${cashbackData.estimatedNetAmount} S (after ${(cashbackData.feeRate / 100)}% fee)`,
        });

        // Refresh cashback data
        await fetchCashbackData();
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error: any) {
      console.error('Claim error:', error);
      
      let errorMessage = 'Claim transaction failed';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was cancelled by user';
      } else if (error.message?.includes('Below minimum claim amount')) {
        errorMessage = `Minimum claim amount is ${cashbackData.minimumClaimAmount} S`;
      } else if (error.message?.includes('Insufficient contract balance')) {
        errorMessage = 'Contract has insufficient balance. Please try again later.';
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