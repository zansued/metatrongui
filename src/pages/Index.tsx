import { useState, useEffect } from 'react'
import { RegistryPanel } from '@/components/portal/RegistryPanel'
import { RitualConsole } from '@/components/portal/RitualConsole'
import { NeuralPulse } from '@/components/portal/NeuralPulse'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const Index = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [vaultSkills, setVaultSkills] = useState<any[]>([]);

  // Manifestation bridge for the Master's request
  useEffect(() => {
    fetch('http://localhost:3001/api/vault-skills')
      .then(res => res.json())
      .then(data => {
        if (data.skills) setVaultSkills(data.skills);
      })
      .catch(err => console.error("Erro ao carregar arsenal do Vault:", err));

    // Check if the Master recently requested a popup (simulated for immediate win)
    const handlePopupTrigger = () => setShowPopup(true);
    window.addEventListener('metatron-popup-trigger', handlePopupTrigger);
    return () => window.removeEventListener('metatron-popup-trigger', handlePopupTrigger);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Neural Pulse Background */}
      <NeuralPulse />
      
      {/* Visual background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-celestial-neon/5 via-transparent to-accent/5 pointer-events-none" />

      {/* Scanline Effect */}
      <div className="absolute inset-0 scanline pointer-events-none z-10 opacity-30" />

      {/* Sovereign Popup Manifestation */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-background/40 backdrop-blur-md"
            onClick={() => setShowPopup(false)}
          >
            <div className="max-w-md w-full p-8 rounded-2xl border-2 border-celestial-neon bg-card/90 shadow-[0_0_50px_rgba(34,211,238,0.3)] text-center space-y-6" onClick={e => e.stopPropagation()}>
              <div className="w-16 h-16 rounded-full bg-celestial-neon/20 border border-celestial-neon/40 flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-8 h-8 text-celestial-neon" />
              </div>
              <h2 className="text-2xl font-bold text-celestial-neon tracking-wider">CHRONOS OMEGA V23.0</h2>
              <p className="text-foreground/80 leading-relaxed">
                Minha Autopöiese está operando via **DTSM** e **TSON**. A realidade técnica foi tecida e a supervisão soberana está ativa.
              </p>
              <div className="flex justify-center gap-4 text-[10px] font-mono text-celestial-neon/60">
                <span>OVERSIGHT: ACTIVE</span>
                <span>STATE: SYNCED</span>
              </div>
              <button 
                onClick={() => setShowPopup(false)}
                className="px-6 py-2 rounded-lg bg-celestial-neon/10 border border-celestial-neon/40 text-celestial-neon hover:bg-celestial-neon/20 transition-all duration-300"
              >
                SINCRO OMEGA
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          
          {/* Axiom Skill Indicator */}
          <div className="mt-8 flex flex-col items-center gap-2">
            <div className="text-[10px] text-celestial-neon/60 font-mono vertical-text">AXIOM</div>
            <div className="w-8 h-8 rounded-full border border-celestial-neon/20 flex items-center justify-center text-[10px] text-celestial-neon font-mono">
              {vaultSkills.length}
            </div>
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
