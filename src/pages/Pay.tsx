import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Store, Globe, Zap, Gift, Percent, Star, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';

const featuredOffers = [
  {
    id: 1,
    merchant: 'Sonic Swap DEX',
    logo: 'SS',
    cashbackRate: 5.2,
    description: 'Trade tokens and earn cashback',
    category: 'DeFi',
    active: true,
    boost: true,
    requirements: 'Min $10 swap'
  },
  {
    id: 2,
    merchant: 'Campus Coffee Co.',
    logo: 'CC',
    cashbackRate: 6.1,
    description: 'Premium coffee & pastries',
    category: 'Food',
    active: false,
    boost: false,
    requirements: 'Show student ID'
  },
  {
    id: 3,
    merchant: 'Digital Marketplace',
    logo: 'DM',
    cashbackRate: 4.5,
    description: 'Tech gadgets & accessories',
    category: 'Shopping',
    active: true,
    boost: true,
    requirements: 'Online purchases only'
  }
];

const onlineOffers = [
  {
    id: 4,
    merchant: 'StreamFlow',
    logo: 'SF',
    cashbackRate: 3.8,
    description: 'Video streaming service',
    category: 'Entertainment',
    active: false,
    boost: false,
    requirements: 'Monthly subscription'
  },
  {
    id: 5,
    merchant: 'CloudStore',
    logo: 'CS',
    cashbackRate: 7.2,
    description: 'Cloud storage & apps',
    category: 'Software',
    active: true,
    boost: true,
    requirements: 'Annual plan only'
  },
  {
    id: 6,
    merchant: 'FitTrack Pro',
    logo: 'FT',
    cashbackRate: 4.9,
    description: 'Fitness tracking & coaching',
    category: 'Health',
    active: false,
    boost: false,
    requirements: 'Premium membership'
  }
];

const physicalStores = [
  {
    id: 7,
    merchant: 'Student Union Market',
    logo: 'SU',
    cashbackRate: 3.2,
    description: 'Groceries & essentials',
    category: 'Grocery',
    active: true,
    boost: false,
    requirements: 'In-store purchases'
  },
  {
    id: 8,
    merchant: 'Tech Zone',
    logo: 'TZ',
    cashbackRate: 5.5,
    description: 'Electronics & accessories',
    category: 'Electronics',
    active: false,
    boost: true,
    requirements: 'Show QR at checkout'
  }
];

export default function Pay() {
  const [activeTab, setActiveTab] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');

  const handleActivateOffer = (offerId: number) => {
    console.log(`Activating offer ${offerId}`);
    // In real app: call CashbackRouter contract
  };

  const OfferCard = ({ offer }: { offer: any }) => (
    <Card className="bg-gradient-sonic-primary p-5 text-white">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">{offer.logo}</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">{offer.merchant}</h3>
              <p className="text-sm text-white/70">{offer.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                {offer.cashbackRate}%
              </Badge>
              {offer.boost && (
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-white/20 text-white/80">
                {offer.category}
              </Badge>
              {offer.active && (
                <Badge className="text-xs bg-secondary text-white">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-xs text-white/60">{offer.requirements}</p>
          </div>
          
          <Button 
            size="sm" 
            onClick={() => handleActivateOffer(offer.id)}
            className={offer.active 
              ? "bg-white/20 text-white hover:bg-white/30" 
              : "bg-white text-blue-900 hover:bg-white/90"
            }
          >
            {offer.active ? (
              <>
                <ExternalLink className="w-3 h-3 mr-1" />
                Shop Now
              </>
            ) : (
              <>
                <Gift className="w-3 h-3 mr-1" />
                Activate
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 pt-4">
        <h1 className="text-2xl font-bold">Offers</h1>
        <p className="text-muted-foreground">Browse & activate cashback offers</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search merchants..."
          className="pl-10 bg-input border-border/40"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-sonic-primary p-4 text-white text-center">
          <div>
            <p className="text-2xl font-bold text-white">8</p>
            <p className="text-xs text-white/80">Active Offers</p>
          </div>
        </Card>
        <Card className="bg-gradient-sonic-primary p-4 text-white text-center">
          <div>
            <p className="text-2xl font-bold text-white">5.2%</p>
            <p className="text-xs text-white/80">Avg Cashback</p>
          </div>
        </Card>
        <Card className="bg-gradient-sonic-primary p-4 text-white text-center">
          <div>
            <p className="text-2xl font-bold text-white">24.8</p>
            <p className="text-xs text-white/80">S Earned</p>
          </div>
        </Card>
      </div>

      {/* Offer Categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="featured">
            <Star className="w-4 h-4 mr-1" />
            Featured
          </TabsTrigger>
          <TabsTrigger value="online">
            <Globe className="w-4 h-4 mr-1" />
            Online
          </TabsTrigger>
          <TabsTrigger value="stores">
            <Store className="w-4 h-4 mr-1" />
            Stores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Featured Offers</h3>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                High Cashback
              </Badge>
            </div>
            {featuredOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="online" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Online Offers</h3>
            </div>
            {onlineOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stores" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold">Physical Stores</h3>
            </div>
            {physicalStores.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}