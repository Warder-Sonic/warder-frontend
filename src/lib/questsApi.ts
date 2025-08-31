export interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  reward: {
    type: string;
    amount: number;
  };
  requirements: Array<{
    type: string;
    details: any;
  }>;
  difficulty: string;
  estimatedTime: string;
  externalUrl?: string;
  sonicApp?: {
    name: string;
    category: string;
  };
  isActive: boolean;
}

export interface Offer {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  merchantName: string;
  category: string;
  cashbackRate: number;
  maxCashback?: number;
  minPurchase?: number;
  currency: string;
  validUntil?: string;
  terms?: string[];
  merchantUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  sonicIntegration?: {
    appUrl: string;
    pointsMultiplier: number;
  };
}

const OFFERS_DB_BASE = 'https://raw.githubusercontent.com/Warder-Sonic/offers-database/main';

class QuestsAPI {
  async getQuests(): Promise<Quest[]> {
    try {
      const response = await fetch(`${OFFERS_DB_BASE}/quests/sonic-ecosystem.json`);
      if (!response.ok) throw new Error('Failed to fetch quests');
      return await response.json();
    } catch (error) {
      console.error('Error fetching quests:', error);
      return [];
    }
  }

  async getOffers(): Promise<Offer[]> {
    try {
      const [ecosystemResponse, pointsResponse] = await Promise.all([
        fetch(`${OFFERS_DB_BASE}/offers/sonic-ecosystem-real.json`),
        fetch(`${OFFERS_DB_BASE}/offers/sonic-points-earn.json`)
      ]);

      if (!ecosystemResponse.ok || !pointsResponse.ok) {
        throw new Error('Failed to fetch offers');
      }

      const ecosystemOffers = await ecosystemResponse.json();
      const pointsOffers = await pointsResponse.json();

      return [...ecosystemOffers, ...pointsOffers].filter(offer => offer.isActive);
    } catch (error) {
      console.error('Error fetching offers:', error);
      return [];
    }
  }

  async getFeaturedOffers(): Promise<Offer[]> {
    const offers = await this.getOffers();
    return offers.filter(offer => offer.isFeatured);
  }

  async getOffersByCategory(category: string): Promise<Offer[]> {
    const offers = await this.getOffers();
    return offers.filter(offer => offer.category === category);
  }

  async getHighMultiplierOffers(): Promise<Offer[]> {
    const offers = await this.getOffers();
    return offers.filter(offer => 
      offer.sonicIntegration && offer.sonicIntegration.pointsMultiplier >= 10
    ).sort((a, b) => 
      (b.sonicIntegration?.pointsMultiplier || 0) - (a.sonicIntegration?.pointsMultiplier || 0)
    );
  }

  questToLegacyFormat(quest: Quest, index: number): any {
    return {
      id: index + 1,
      title: quest.title,
      description: quest.description,
      reward: quest.reward.amount,
      duration: quest.estimatedTime,
      completed: false,
      unlocked: true,
      category: this.mapCategory(quest.category),
      icon: this.getCategoryIcon(quest.category),
      externalUrl: quest.externalUrl,
      sonicApp: quest.sonicApp
    };
  }

  private mapCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      'sonic-apps': 'Discovery',
      'defi': 'DeFi',
      'staking': 'DeFi',
      'bridge': 'DeFi',
      'gaming': 'GambleFi',
      'nft': 'Discovery',
      'education': 'Campus'
    };
    return categoryMap[category] || 'Discovery';
  }

  private getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
      'sonic-apps': 'Trophy',
      'defi': 'Coins',
      'staking': 'Zap',
      'bridge': 'Zap',
      'gaming': 'Play',
      'nft': 'BookOpen',
      'education': 'BookOpen'
    };
    return iconMap[category] || 'Trophy';
  }
}

export const questsAPI = new QuestsAPI();