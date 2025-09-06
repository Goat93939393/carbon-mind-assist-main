import { motion, AnimatePresence } from 'framer-motion';
import { UserProgress } from '@/types';
import { useState, useEffect } from 'react';

interface LevelIndicatorProps {
  userProgress: UserProgress;
  showLevelUp?: boolean;
}

export const LevelIndicator = ({ userProgress, showLevelUp = false }: LevelIndicatorProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showLevelUp) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showLevelUp]);

  const progressPercentage = userProgress.experienceToNext > 0 
    ? ((userProgress.experience % 100) / 100) * 100 
    : 100;

  return (
    <div className="relative">
      <motion.div
        className={`
          w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xs
          transition-all duration-300
          ${isAnimating 
            ? 'border-primary bg-primary text-primary-foreground' 
            : 'border-border bg-level-bg text-level-text'
          }
        `}
        animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <div className="text-[8px] opacity-60 font-normal">LV</div>
          <div className="text-xs font-bold leading-none">{userProgress.level}</div>
        </div>
        
        {/* Minimal progress ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 48 48"
        >
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="opacity-20"
          />
          <motion.circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke={isAnimating ? "hsl(var(--primary))" : "hsl(var(--level-active))"}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progressPercentage / 100 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              pathLength: progressPercentage / 100,
              strokeDasharray: `${2 * Math.PI * 22}`,
            }}
          />
        </svg>
      </motion.div>

      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium"
          >
            LEVEL UP!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};