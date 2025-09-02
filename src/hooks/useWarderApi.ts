import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

export function useTransactions(page = 1, limit = 20, filters?: {
  user?: string;
  dex?: string;
  processed?: boolean;
}) {
  return useQuery({
    queryKey: ['transactions', page, limit, filters],
    queryFn: () => apiService.getTransactions(page, limit, filters),
    refetchInterval: 10000,
  });
}

export function useWalletBalance(address: string | undefined) {
  return useQuery({
    queryKey: ['walletBalance', address],
    queryFn: () => address ? apiService.getWalletBalance(address) : Promise.reject('No address'),
    enabled: !!address,
    refetchInterval: 10000,
  });
}

export function useProcessClaim() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userAddress, amount }: { userAddress: string; amount: string }) => 
      apiService.processClaim(userAddress, amount),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['walletBalance', data.userAddress] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}