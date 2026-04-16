import { motion } from "motion/react";

interface GloboProps {
  state: 'idle' | 'thinking' | 'happy' | 'explaining' | 'greeting';
}

export default function GloboCharacter({ state }: GloboProps) {
  const variants = {
    idle: {
      y: [0, -10, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
    thinking: {
      rotate: [0, 5, -5, 0],
      y: [0, -5, 0],
      transition: { duration: 1, repeat: Infinity }
    },
    happy: {
      scale: [1, 1.2, 1],
      y: [0, -30, 0],
      transition: { duration: 0.5, repeat: 2 }
    },
    explaining: {
      x: [0, 10, -10, 0],
      transition: { duration: 2, repeat: Infinity }
    },
    greeting: {
      rotate: [0, 20, 0],
      transition: { duration: 0.5, repeat: 3 }
    }
  };

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <motion.div
        animate={state}
        variants={variants}
        className="relative z-10"
      >
        {/* Simple SVG Robot Character */}
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Body */}
          <rect x="25" y="40" width="50" height="40" rx="10" fill="#3B82F6" />
          <rect x="30" y="45" width="40" height="30" rx="5" fill="#60A5FA" />
          
          {/* Head */}
          <rect x="35" y="15" width="30" height="25" rx="8" fill="#3B82F6" />
          
          {/* Eyes */}
          <motion.circle 
            cx="42" cy="28" r="3" fill="white" 
            animate={state === 'thinking' ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          <motion.circle 
            cx="58" cy="28" r="3" fill="white" 
            animate={state === 'thinking' ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
          />
          
          {/* Antenna */}
          <line x1="50" y1="15" x2="50" y2="5" stroke="#3B82F6" strokeWidth="2" />
          <motion.circle 
            cx="50" cy="5" r="3" fill="#EF4444"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          
          {/* Compass Icon on Chest */}
          <circle cx="50" cy="60" r="8" fill="white" fillOpacity="0.2" />
          <path d="M50 55L52 60L50 65L48 60L50 55Z" fill="#FBBF24" />
          
          {/* Backpack (Subtle) */}
          <rect x="20" y="50" width="10" height="25" rx="2" fill="#1E40AF" />
        </svg>
      </motion.div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full -z-0 animate-pulse" />
    </div>
  );
}
