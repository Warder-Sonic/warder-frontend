// Sonic Testnet Configuration
export const SONIC_TESTNET = {
    chainId: 14601,
    name: 'Sonic Testnet',
    rpcUrl: 'https://rpc.testnet.soniclabs.com/',
    nativeCurrency: {
      name: 'Sonic',
      symbol: 'S',
      decimals: 18,
    },
    blockExplorer: 'https://testnet.sonicscan.org',
  };
  
  // Contract Addresses
  export const CONTRACTS = {
    WARDER_WALLET: '0xa83F9277F984DF0056E7E690016c1eb4FC5757ca',
    // Add other contract addresses as needed
    // TREASURY: '0x...',
    // STOKEN: '0x...',
  };
  
  // Contract ABIs
  export const WARDER_WALLET_ABI = [
    // Read functions
    "function cashbackBalances(address) external view returns (uint256)",
    "function getUserBalance(address _user) external view returns (uint256)",
    "function getMyBalance() external view returns (uint256)",
    "function totalCashbackHeld() external view returns (uint256)",
    "function totalClaimedAmount() external view returns (uint256)",
    "function minimumClaimAmount() external view returns (uint256)",
    "function claimFeeRate() external view returns (uint256)",
    "function canClaim(address _user) external view returns (bool)",
    "function calculateClaimFee(address _user) external view returns (uint256 fee, uint256 netAmount)",
    
    // Write functions
    "function claimCashback() external",
    
    // Events
    "event CashbackCredited(address indexed user, uint256 amount)",
    "event CashbackClaimed(address indexed user, uint256 amount, uint256 fee)",
  ] as const;
  
  export const NETWORK_CONFIG = {
    [SONIC_TESTNET.chainId]: SONIC_TESTNET,
  };