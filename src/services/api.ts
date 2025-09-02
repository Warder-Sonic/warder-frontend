const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  timestamp: Date;
  gasUsed: string;
  gasPrice?: string;
  contractAddress: string;
  dexName?: string;
  swapType?: string;
  processed: boolean;
  cashbackAmount: string;
  cashbackRate: number;
  treasuryTxHash?: string;
  processedAt?: Date;
}

export interface WalletBalance {
  userAddress: string;
  cashbackBalance: string;
  recentTransactions: Transaction[];
}

export interface ClaimResult {
  userAddress: string;
  claimedAmount: string;
  feeAmount: string;
  netAmount: string;
  transactionHash: string;
}

class ApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  async getTransactions(page = 1, limit = 20, filters?: {
    user?: string;
    dex?: string;
    processed?: boolean;
  }): Promise<{ transactions: Transaction[]; pagination: any }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filters?.user) params.append('user', filters.user);
    if (filters?.dex) params.append('dex', filters.dex);
    if (filters?.processed !== undefined) params.append('processed', filters.processed.toString());

    return this.fetchApi(`/api/transactions?${params}`);
  }

  async getWalletBalance(address: string): Promise<WalletBalance> {
    return this.fetchApi<WalletBalance>(`/api/users/${address}/balance`);
  }

  async processClaim(userAddress: string, amount: string): Promise<ClaimResult> {
    return this.fetchApi<ClaimResult>('/api/claim/process', {
      method: 'POST',
      body: JSON.stringify({ userAddress, amount }),
    });
  }
}

export const apiService = new ApiService();