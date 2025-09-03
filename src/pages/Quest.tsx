import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Play, CheckCircle, Lock, Coins, BookOpen, Zap, ExternalLink } from 'lucide-react';
import { questsAPI } from '@/lib/questsApi';

const legacyQuests = [
  {
    id: 1,
    title: 'Degen Express Launch',
    description: 'Launch your first memecoin with zero initial liquidity',
    reward: 50,
    duration: '10 min',
    completed: true,
    category: 'LaunchPad',
    icon: BookOpen,
  },
  {
    id: 2,
    title: 'Campus Payment Pro',
    description: 'Complete 25 campus transactions using SonicPay',
    reward: 80,
    duration: '1 week',
    completed: false,
    unlocked: true,
    category: 'Campus',
    icon: Zap,
  },
];

export default function Quest() {
  const [selectedQuest, setSelectedQuest] = useState<number | null>(null);
  const [sonicQuests, setSonicQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadQuests = async () => {
      try {
        const rawQuests = await questsAPI.getQuests();
        const formattedQuests = rawQuests.map((quest, index) => questsAPI.questToLegacyFormat(quest, index + 100));
        setSonicQuests(formattedQuests);
      } catch (error) {
        console.error('Failed to load quests:', error);
      } finally {
        setLoading(false);
      }
    };
    loadQuests();
  }, []);

  const allQuests = [...legacyQuests, ...sonicQuests];
  const totalEarned = allQuests.filter(q => q.completed).reduce((sum, q) => sum + q.reward, 0);
  const totalPossible = allQuests.reduce((sum, q) => sum + q.reward, 0);
  const progress = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'LaunchPad': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'GambleFi': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'DeFi': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Discovery': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Advanced': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Campus': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const handleQuestClick = (quest: any) => {
    if (quest.externalUrl) {
      window.open(quest.externalUrl, '_blank');
    } else if (quest.unlocked !== false) {
      setSelectedQuest(quest.id);
    }
  };

  const getIcon = (iconName: string | any) => {
    if (typeof iconName === 'string') {
      switch (iconName) {
        case 'Trophy': return Trophy;
        case 'Coins': return Coins;
        case 'Zap': return Zap;
        case 'BookOpen': return BookOpen;
        case 'Play': return Play;
        default: return Trophy;
      }
    }
    return iconName;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center space-y-2 pt-4">
          <h1 className="text-2xl font-bold">Quest</h1>
          <p className="text-muted-foreground">Loading Sonic ecosystem quests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center space-y-2 pt-4">
        <h1 className="text-2xl font-bold">Quest</h1>
        <p className="text-muted-foreground">Learn about Sonic and earn S tokens</p>
      </div>

      <Card className="bg-gradient-sonic-primary p-6 text-white">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm font-medium">Total Earned</p>
              <p className="text-3xl font-bold">{totalEarned} <span className="text-sonic-hero-yellow">S</span></p>
            </div>
            <Trophy className="w-8 h-8 text-white/90" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Quest Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="bg-white/20" />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Available Quests</h2>
        
        {allQuests.map((quest) => {
          const IconComponent = getIcon(quest.icon);
          return (
            <Card 
              key={quest.id} 
              className={`bg-gradient-sonic-primary p-4 text-white transition-smooth ${
                quest.unlocked !== false ? 'cursor-pointer hover:opacity-90' : 'opacity-60'
              }`}
              onClick={() => handleQuestClick(quest)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    quest.completed 
                      ? 'bg-green-500/20' 
                      : quest.unlocked !== false
                        ? 'bg-white/20' 
                        : 'bg-white/10'
                  }`}>
                    {quest.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : quest.unlocked !== false ? (
                      <IconComponent className="w-6 h-6 text-white" />
                    ) : (
                      <Lock className="w-6 h-6 text-white/60" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white">{quest.title}</h3>
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(quest.category)}`}>
                        {quest.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-white/70">{quest.description}</p>
                    <p className="text-xs text-white/60 mt-1">{quest.duration}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-accent">
                    <span className="font-semibold">{quest.reward} S</span>
                  </div>
                  {quest.completed ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 mt-2">
                      Completed
                    </Badge>
                  ) : quest.unlocked !== false ? (
                    <Button size="sm" className="mt-2 bg-secondary hover:bg-secondary/80 text-white">
                      {quest.externalUrl ? (
                        <>
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Visit
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </>
                      )}
                    </Button>
                  ) : (
                    <Badge variant="outline" className="mt-2 text-white/60 border-white/30">
                      Locked
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-sonic-primary p-6 text-center text-white">
        <Trophy className="w-12 h-12 text-accent mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-2 text-white">More Quests Coming Soon!</h3>
        <p className="text-sm text-white/70">
          Complete current quests to unlock advanced topics about Sonic ecosystem
        </p>
      </Card>
    </div>
  );
}