import { RegistryPanel } from '@/components/portal/RegistryPanel'
import { RitualConsole } from '@/components/portal/RitualConsole'
import { NeuralPulse } from '@/components/portal/NeuralPulse'
import { motion } from 'framer-motion'

const Index = () => {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Neural Pulse Background */}
      <NeuralPulse />
      
      {/* Visual background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-celestial-neon/5 via-transparent to-accent/5 pointer-events-none" />

      {/* Scanline Effect */}
      <div className="absolute inset-0 scanline pointer-events-none z-10 opacity-30" />

      <div className="relative z-0 flex h-full">
        {/* Sidebar / Navigation (Left) */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
          className="hidden lg:flex w-16 flex-col items-center py-6 border-r border-border bg-card/30 backdrop-blur-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-celestial-neon/20 border border-celestial-neon/30 flex items-center justify-center glow-neon">
            <span className="text-celestial-neon font-bold text-lg">M</span>
          </div>
          <div className="mt-auto w-2 h-2 rounded-full bg-celestial-neon animate-pulse" />
        </motion.div>

        {/* Main Interface */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.2, 0, 0, 1] }}
          className="flex-1 min-w-0"
        >
          <RitualConsole />
        </motion.div>

        {/* Knowledge Panel (Right) */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.2, 0, 0, 1] }}
          className="hidden md:block w-80 lg:w-96"
        >
          <RegistryPanel />
        </motion.div>
      </div>
    </div>
  )
}

export default Index
