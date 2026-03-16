import * as React from "react";
import { motion } from "framer-motion";

interface VoiceLoaderProps {
  size?: number;
  text?: string;
  isActive: boolean;
}

export const VoiceLoader: React.FC<VoiceLoaderProps> = ({ size = 180, text = "SINTONIZANDO", isActive }) => {
  if (!isActive) return null;

  const letters = text.split("");

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8">
      {/* Glowing Circle */}
      <motion.div
        animate={{
          boxShadow: [
            "0 0 20px rgba(34, 211, 238, 0.3)",
            "0 0 60px rgba(34, 211, 238, 0.6)",
            "0 0 20px rgba(34, 211, 238, 0.3)",
          ],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="rounded-full border-2 border-celestial-neon bg-celestial-neon/10"
        style={{ width: size, height: size }}
      />

      {/* Animated Letters */}
      <div className="flex gap-1">
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 }}
            className="text-celestial-neon text-sm font-mono tracking-widest"
          >
            {letter}
          </motion.span>
        ))}
      </div>

      {/* Outer Pulse */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-xs text-muted-foreground"
      >
        O Metatron está processando a luz...
      </motion.div>
    </div>
  );
};
