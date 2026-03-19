import * as React from "react";
import { motion } from "framer-motion";

interface VoiceLoaderProps {
  size?: number;
  text?: string;
  isActive: boolean;
}

export const VoiceLoader: React.FC<VoiceLoaderProps> = ({ size = 200, text = "METATRON", isActive }) => {
  if (!isActive) return null;

  const letters = text.split("");

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outermost ring - slow rotation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="96" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.3" />
            {/* Dashed arc segments */}
            <circle cx="100" cy="100" r="96" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5"
              strokeDasharray="40 20 60 30 25 45" opacity="0.5" />
            {/* Tick marks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const angle = (i * 6) * Math.PI / 180;
              const isMajor = i % 5 === 0;
              const r1 = isMajor ? 89 : 91;
              const r2 = 95;
              return (
                <line
                  key={i}
                  x1={100 + r1 * Math.cos(angle)}
                  y1={100 + r1 * Math.sin(angle)}
                  x2={100 + r2 * Math.cos(angle)}
                  y2={100 + r2 * Math.sin(angle)}
                  stroke="hsl(var(--primary))"
                  strokeWidth={isMajor ? 1.5 : 0.5}
                  opacity={isMajor ? 0.7 : 0.3}
                />
              );
            })}
          </svg>
        </motion.div>

        {/* Second ring - reverse rotation */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.2" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(var(--primary))" strokeWidth="2"
              strokeDasharray="30 15 50 25" opacity="0.6" />
            {/* Data blocks */}
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 15) * Math.PI / 180;
              const r = 75;
              return (
                <rect
                  key={i}
                  x={100 + r * Math.cos(angle) - 2}
                  y={100 + r * Math.sin(angle) - 1}
                  width={4}
                  height={2}
                  fill="hsl(var(--primary))"
                  opacity={i % 3 === 0 ? 0.8 : 0.3}
                  rx="0.5"
                />
              );
            })}
          </svg>
        </motion.div>

        {/* Third ring - fast rotation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="64" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5"
              strokeDasharray="20 10 40 15" opacity="0.5" />
            {/* Accent arcs */}
            <path
              d="M 100 36 A 64 64 0 0 1 164 100"
              fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" opacity="0.8"
              strokeLinecap="round"
            />
            <path
              d="M 100 164 A 64 64 0 0 1 36 100"
              fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" opacity="0.8"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* Inner circle - pulsing glow */}
        <motion.div
          animate={{
            boxShadow: [
              "0 0 20px hsl(var(--primary) / 0.2), inset 0 0 20px hsl(var(--primary) / 0.1)",
              "0 0 40px hsl(var(--primary) / 0.4), inset 0 0 30px hsl(var(--primary) / 0.2)",
              "0 0 20px hsl(var(--primary) / 0.2), inset 0 0 20px hsl(var(--primary) / 0.1)",
            ],
            borderColor: [
              "hsl(var(--primary) / 0.4)",
              "hsl(var(--primary) / 0.8)",
              "hsl(var(--primary) / 0.4)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute rounded-full border-2 bg-background/80 backdrop-blur-sm flex items-center justify-center"
          style={{
            top: '25%', left: '25%', width: '50%', height: '50%',
          }}
        >
          {/* METATRON text */}
          <div className="flex gap-[2px]">
            {letters.map((letter, index) => (
              <motion.span
                key={index}
                animate={{ 
                  opacity: [0.4, 1, 0.4],
                  textShadow: [
                    "0 0 4px hsl(var(--primary) / 0.3)",
                    "0 0 12px hsl(var(--primary) / 0.8)",
                    "0 0 4px hsl(var(--primary) / 0.3)",
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.12 }}
                className="text-primary text-xs font-bold font-mono tracking-widest"
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Scanning line */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <line x1="100" y1="100" x2="196" y2="100" stroke="url(#scanGrad)" strokeWidth="1.5" />
            <circle cx="196" cy="100" r="2" fill="hsl(var(--primary))" opacity="0.9" />
          </svg>
        </motion.div>

        {/* Corner data readouts */}
        {[
          { x: '0%', y: '0%', anchor: 'start' },
          { x: '100%', y: '0%', anchor: 'end' },
          { x: '0%', y: '100%', anchor: 'start' },
          { x: '100%', y: '100%', anchor: 'end' },
        ].map((pos, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
            className="absolute text-[8px] font-mono text-primary/60"
            style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
          >
            {['◇◇◇', '////', '○○○○', '▪▪▪▪'][i]}
          </motion.div>
        ))}
      </div>

      {/* Status text below */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-xs text-muted-foreground font-mono mt-4"
      >
        Processando a luz cósmica...
      </motion.div>
    </div>
  );
};
