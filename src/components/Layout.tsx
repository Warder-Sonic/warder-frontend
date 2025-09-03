import { ReactNode } from 'react';
import { Home, Gift, Receipt, Trophy, User } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ConnectWallet } from '@/components/ConnectWallet';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Gift, label: 'Offers', path: '/pay' },
  { icon: Receipt, label: 'Claims', path: '/activity' },
  { icon: Trophy, label: 'Quest', path: '/quest' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Connect Wallet Section */}
      <div className="p-4 pt-6">
        <ConnectWallet />
      </div>

      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-smooth",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}