import { motion } from 'framer-motion';
import { BookOpen, MessageCircle, Zap } from 'lucide-react';
import { AppState } from '@/types';

interface SidebarProps {
  activeTab: AppState['activeTab'];
  onTabChange: (tab: AppState['activeTab']) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const tabs = [
    { id: 'notes' as const, label: 'NOTES', icon: BookOpen },
    { id: 'chat' as const, label: 'AI CHAT', icon: MessageCircle },
  ];

  return (
    <div className="w-64 bg-gradient-main border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center">
            <Zap className="w-5 h-5 text-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">
            MIND NOTES
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-md font-medium text-sm
                  transition-all duration-200 relative
                  ${isActive 
                    ? 'text-primary-foreground bg-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }
                `}
                whileHover={{ x: isActive ? 0 : 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};