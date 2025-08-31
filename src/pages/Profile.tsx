import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, Award, Wallet, TrendingUp, Users, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';

export default function Profile() {
  const user = {
    name: 'Alex Chen',
    email: 'alex.chen@university.edu',
    studentId: 'STU-2024-001',
    university: 'Sonic University',
    joinDate: 'January 2024',
  };

  const stats = {
    totalSpent: 1247.80,
    totalCashback: 62.39,
    questsCompleted: 3,
    rank: 'Silver Scholar',
  };

  const achievements = [
    { name: 'Early Adopter', description: 'One of the first 100 users', earned: true },
    { name: 'Quest Master', description: 'Completed 5 quests', earned: false, progress: 3 },
    { name: 'Spender', description: 'Spent $1000+ on campus', earned: true },
    { name: 'Cashback King', description: 'Earned $100+ in cashback', earned: false, progress: 62 },
  ];

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
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-white/90 text-sm">{user.email}</p>
            <p className="text-white/70 text-xs">{user.university}</p>
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
              <p className="text-sm text-white/80">Total Spent</p>
              <p className="font-bold text-white">${stats.totalSpent.toFixed(2)}</p>
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
              <p className="font-bold text-white">{stats.totalCashback.toFixed(2)} <span className="text-sonic-hero-orange">S</span></p>
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
              <p className="text-sm text-white/80">Member Since</p>
              <p className="font-bold text-sm text-white">{user.joinDate}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Achievements</h2>
        
        {achievements.map((achievement, index) => (
          <Card key={index} className="bg-gradient-sonic-primary p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  achievement.earned ? 'bg-green-500/20' : 'bg-white/20'
                }`}>
                  <Award className={`w-5 h-5 ${
                    achievement.earned ? 'text-green-400' : 'text-white/70'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-white">{achievement.name}</p>
                  <p className="text-sm text-white/70">{achievement.description}</p>
                  {!achievement.earned && achievement.progress && (
                    <p className="text-xs text-accent mt-1">
                      Progress: {achievement.progress}/{achievement.name === 'Quest Master' ? 5 : 100}
                    </p>
                  )}
                </div>
              </div>
              
              {achievement.earned ? (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  Earned
                </Badge>
              ) : (
                <Badge variant="outline" className="border-white/30 text-white/70">
                  Locked
                </Badge>
              )}
            </div>
          </Card>
        ))}
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