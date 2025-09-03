import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { CONTRACTS, ERC20_ABI } from '@/lib/contracts';
import { useToast } from './use-toast';

interface TokenApprovalState {
  allowance: string;
  isApproved: boolean;
  isApproving: boolean;
  error: string | null;
}

export const useTokenApproval = (spender: string = CONTRACTS.WARDER_WALLET, requiredAmount: string = '0') => {
  const { provider, signer, address, isConnected, isOnSonicNetwork } = useWallet();
  const { toast } = useToast();
  
  const [approvalState, setApprovalState] = useState<TokenApprovalState>({
    allowance: '0',
    isApproved: false,
    isApproving: false,
    error: null,
  });

  const checkAllowance = async () => {
    if (!provider || !address || !isConnected || !isOnSonicNetwork) {
      setApprovalState(prev => ({ ...prev, allowance: '0', isApproved: false }));
      return;
    }

    try {
      const tokenContract = new ethers.Contract(CONTRACTS.STOKEN, ERC20_ABI, provider);
      const allowance = await tokenContract.allowance(address, spender);
      const allowanceString = allowance.toString();
      
      const isApproved = requiredAmount === '0' 
        ? allowance > 0n 
        : allowance >= ethers.parseEther(requiredAmount);

      setApprovalState(prev => ({
        ...prev,
        allowance: allowanceString,
        isApproved,
        error: null,
      }));
      
    } catch (error: any) {
      console.error('Error checking allowance:', error);
      setApprovalState(prev => ({
        ...prev,
        error: error.message || 'Failed to check token allowance',
      }));
    }
  };

  const approveToken = async (amount?: string) => {
    if (!signer || !address || !isConnected || !isOnSonicNetwork) {
      toast({
        title: "Connection Required",
        description: "Please connect your wallet and switch to Sonic network",
        variant: "destructive"
      });
      return false;
    }

    setApprovalState(prev => ({ ...prev, isApproving: true, error: null }));

    try {
      const tokenContract = new ethers.Contract(CONTRACTS.STOKEN, ERC20_ABI, signer);
      
      const approvalAmount = amount 
        ? ethers.parseEther(amount)
        : ethers.MaxUint256;

      const gasEstimate = await tokenContract.approve.estimateGas(spender, approvalAmount);
      const gasLimit = gasEstimate * 120n / 100n;

      const tx = await tokenContract.approve(spender, approvalAmount, { gasLimit });
      
      toast({
        title: "Approval Transaction Submitted",
        description: "Your token approval transaction has been submitted",
      });

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast({
          title: "Approval Successful!",
          description: "S token spending has been approved",
        });
        
        await checkAllowance();
        setApprovalState(prev => ({ ...prev, isApproving: false }));
        return true;
      } else {
        throw new Error('Approval transaction failed');
      }

    } catch (error: any) {
      console.error('Approval error:', error);
      
      let errorMessage = 'Token approval failed';
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        errorMessage = 'Approval was cancelled by user';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Approval Failed",
        description: errorMessage,
        variant: "destructive"
      });

      setApprovalState(prev => ({ 
        ...prev, 
        isApproving: false, 
        error: errorMessage 
      }));
      return false;
    }
  };

  useEffect(() => {
    if (isConnected && isOnSonicNetwork && address) {
      checkAllowance();
    }
  }, [isConnected, isOnSonicNetwork, address, spender, requiredAmount]);

  return {
    ...approvalState,
    approveToken,
    checkAllowance,
  };
};