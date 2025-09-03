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
  
  export const CONTRACTS = {
    WARDER_WALLET: '0xa83F9277F984DF0056E7E690016c1eb4FC5757ca',
    STOKEN: '0x2789213A4725FFF214DF9cA5B2fFe3b446f6A9e5',
    TREASURY: '0x1DC6CEE4D32Cc8B06fC4Cea268ccd774451E08b4',
    FEE_MANAGER: '0x7Df5fda5E528ba80E84C3462cA7D7454c5129c7b',
  };
  
  export const WARDER_WALLET_ABI = [
    "function cashbackBalances(address) external view returns (uint256)",
    "function totalCashbackHeld() external view returns (uint256)",
    "function creditCashback(address _user, uint256 _amount) external",
    "function claimCashback() external",
    "function minimumClaimAmount() external view returns (uint256)",
    "function claimFeeRate() external view returns (uint256)",
    "function canClaim(address _user) external view returns (bool)",
    "function calculateClaimFee(address _user) external view returns (uint256 fee, uint256 netAmount)",
    "event CashbackCredited(address indexed user, uint256 amount)",
    "event CashbackClaimed(address indexed user, uint256 amount, uint256 fee)",
  ] as const;

  export const FEE_MANAGER_ABI = [
    "function processClaim(address _user, uint256 _amount) external payable",
    "function calculateFee(uint256 _amount) external view returns (uint256)",
    "function treasuryShare() external view returns (uint256)",
    "function sonicShare() external view returns (uint256)",
  ] as const;

  export const ERC20_ABI = [
    "function balanceOf(address owner) external view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function totalSupply() external view returns (uint256)",
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string)",
    "function name() external view returns (string)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
  ] as const;
  
  export const NETWORK_CONFIG = {
    [SONIC_TESTNET.chainId]: SONIC_TESTNET,
  };