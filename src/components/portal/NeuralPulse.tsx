import { motion } from 'framer-motion'

export function NeuralPulse() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Hexagonal Grid lines */}
      <svg className="absolute w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex-grid" width="50" height="43.3" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <path d="M25 0 L50 14.4 L50 43.3 L25 57.7 L0 43.3 L0 14.4 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-celestial-neon" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-grid)" />
      </svg>

      {/* Pulsing Neural Nodes */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-celestial-neon glow-neon"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: 0.1,
            scale: 0.5
          }}
          animate={{
            opacity: [0.1, 0.6, 0.1],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}

      {/* Moving Light Rays */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-celestial-neon/10 to-transparent"
        animate={{
          opacity: [0.2, 0.4, 0.2],
          y: ["-100%", "100%"]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  )
}
