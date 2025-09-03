import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, Award, Wallet, TrendingUp, Users, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useWalletBalance } from '@/hooks/useWarderApi';

export default function Profile() {
  const { address, isConnected } = useWallet();
  const { data: walletBalance } = useWalletBalance(address);

  const stats = {
    totalSpent: parseFloat(walletBalance?.cashbackBalance || '0'),
    totalCashback: parseFloat(walletBalance?.cashbackBalance || '0'),
    questsCompleted: walletBalance?.recentTransactions?.length || 0,
    rank: 'Sonic User',
  };


  const menuItems = [
    { icon: Settings, label: 'Account Settings', description: 'Manage your account' },
    { icon: Wallet, label: 'Payment Methods', description: 'Manage cards and payment' },
    { icon: Bell, label: 'Notifications', description: 'Configure alerts' },
    { icon: Shield, label: 'Security', description: 'Privacy and security settings' },
    { icon: HelpCircle, label: 'Help & Support', description: 'Get help and contact us' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 pt-4">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your SonicPay account</p>
      </div>

      {/* User Profile Card */}
      <Card className="bg-gradient-sonic-primary p-6 text-white">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-white/20">
            <AvatarImage src="" />
            <AvatarFallback className="bg-white/20 text-white text-lg font-semibold">
              {address ? address.slice(2, 4).toUpperCase() : 'W'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}</h2>
            <p className="text-white/90 text-sm">{isConnected ? 'Connected' : 'Not Connected'}</p>
            <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
              {stats.rank}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-sonic-primary p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/80">Balance</p>
              <p className="font-bold text-white">{stats.totalSpent.toFixed(2)} S</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-sonic-primary p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/80">Cashback</p>
              <p className="font-bold text-white">{stats.totalCashback.toFixed(2)} S</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-sonic-primary p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/80">Quests</p>
              <p className="font-bold text-white">{stats.questsCompleted} Completed</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-sonic-primary p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/80">Transactions</p>
              <p className="font-bold text-sm text-white">{stats.questsCompleted}</p>
            </div>
          </div>
        </Card>
      </div>


      {/* Menu Options */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Settings</h2>
        
        {menuItems.map((item, index) => (
          <Card key={index} className="bg-gradient-sonic-primary p-4 text-white cursor-pointer hover:opacity-90 transition-smooth">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{item.label}</p>
                <p className="text-sm text-white/70">{item.description}</p>
              </div>
            </div>
          </Card>
        ))}
        
        {/* Logout Button */}
        <Button variant="destructive" className="w-full" size="lg">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}