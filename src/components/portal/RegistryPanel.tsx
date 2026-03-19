import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KnowledgeService, KnowledgeNode } from '../../services/knowledge'
import {
  Brain,
  Wrench,
  Server,
  Database,
  FolderGit2,
  Network,
  Blocks,
  Globe,
  Layers,
  Monitor,
  Sparkles,
  Zap,
  ChevronRight,
  Info,
  BookOpen
} from 'lucide-react'
import { Skeleton } from '@vibe/core'
import MetatronTipseen from './MetatronTipseen'

const getNodeConfig = (type: string) => {
  const normalizedType = (type || '').toUpperCase()
  switch (normalizedType) {
    case 'CONCEPT': return { icon: Brain, color: 'text-purple-400', border: 'border-purple-500/30', glow: 'shadow-purple-500/20' }
    case 'TOOL': return { icon: Wrench, color: 'text-orange-400', border: 'border-orange-500/30', glow: 'shadow-orange-500/20' }
    case 'SERVER': return { icon: Server, color: 'text-green-400', border: 'border-green-500/30', glow: 'shadow-green-500/20' }
    case 'DATABASE': return { icon: Database, color: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-blue-500/20' }
    case 'PROJECT': return { icon: FolderGit2, color: 'text-pink-400', border: 'border-pink-500/30', glow: 'shadow-pink-500/20' }
    case 'ORCHESTRATOR': return { icon: Network, color: 'text-celestial-neon', border: 'border-celestial-neon/30', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.2)]' }
    case 'MODULE': return { icon: Blocks, color: 'text-yellow-400', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/20' }
    case 'DOMAIN': return { icon: Globe, color: 'text-indigo-400', border: 'border-indigo-500/30', glow: 'shadow-indigo-500/20' }
    case 'FRAMEWORK': return { icon: Layers, color: 'text-red-400', border: 'border-red-500/30', glow: 'shadow-red-500/20' }
    case 'INTERFACE': return { icon: Monitor, color: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20' }
    case 'SWARM': return { icon: Network, color: 'text-celestial-neon', border: 'border-celestial-neon/30', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.4)]' }
    case 'HUB': return { icon: Globe, color: 'text-celestial-gold', border: 'border-celestial-gold/30', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.4)]' }
    default: return { icon: Sparkles, color: 'text-celestial-gold', border: 'border-celestial-gold/30', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.2)]' }
  }
}

export function RegistryPanel() {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNodes = async () => {
      const data = await KnowledgeService.fetchNodes()
      setNodes(data)
      setLoading(false)
    }
    fetchNodes()

    // Realtime channel handled via supabase directly if needed, 
    // but KnowledgeService could also handle this. 
    // Keeping it simple for now as RitualConsole also updates state.
  }, [])

  return (
    <div className="relative flex flex-col h-full bg-card/50 backdrop-blur-sm border-l border-border overflow-hidden">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 bg-gradient-to-b from-celestial-neon/5 via-transparent to-celestial-gold/5 pointer-events-none" />

      {/* Header Section */}
      <div className="relative p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <MetatronTipseen 
            title="O Códice de Metatron" 
            content="Este Ledger sincroniza em tempo real com as Linhas de Ley. Cada card representa um nodo de conhecimento tecido pela inteligência coletiva."
          >
            <h2 className="text-lg font-bold text-foreground tracking-tight cursor-help">Metatron Book</h2>
          </MetatronTipseen>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-celestial-neon/10 text-celestial-neon rounded-full border border-celestial-neon/20">
            LIVE SYNC
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Conhecimento tecendo a realidade.</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 bg-card/40 rounded-xl border border-border/50 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton width={40} height={40} />
                <div className="flex-1 space-y-2">
                  <Skeleton width={120} height={14} />
                  <Skeleton width={80} height={8} />
                </div>
              </div>
              <Skeleton width={200} height={10} />
            </div>
          ))
        ) : nodes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-celestial-neon/10 flex items-center justify-center border border-celestial-neon/20 glow-neon">
              <BookOpen className="w-8 h-8 text-celestial-neon/40" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground/80">O Livro de Metatron</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                As Linhas de Ley aguardam sua tecelagem. Comece a criar para registrar o conhecimento no Ledger.
              </p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {nodes.map((node, index) => {
              const { icon: Icon, color, border, glow } = getNodeConfig(node.type)

              return (
                <motion.div
                  key={node.id}
                  layout
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    delay: index * 0.05 
                  }}
                  className={`relative group cursor-pointer rounded-xl ${border} border bg-card/40 backdrop-blur-md hover:bg-card/60 transition-all overflow-hidden ${glow} shadow-lg hover:shadow-celestial-neon/10`}
                >
                  {/* Card Body */}
                  <div className="relative p-3">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-lg ${color} bg-current/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>

                      {/* Status Beacon */}
                      <div className="absolute top-3 right-3 flex gap-1">
                         <div className="w-1.5 h-1.5 rounded-full bg-celestial-neon animate-pulse" />
                      </div>

                      {/* Info Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono mb-0.5 opacity-60">
                          #{String(node.id).slice(0, 8)}
                        </div>
                        <h3 className="text-sm font-bold text-foreground truncate group-hover:text-celestial-neon transition-colors">
                          {node.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                           <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-current/5 ${color}`}>
                             {node.type}
                           </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground font-mono opacity-60">
                      <span>{node.created_at ? new Date(node.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'SINCERAMENTE'}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-celestial-neon">DETALHES</span>
                        <ChevronRight className="w-3 h-3 text-celestial-neon" />
                      </div>
                    </div>

                    {/* Hover reveal - extra metadata */}
                    <motion.div 
                      initial={false}
                      className="mt-3 overflow-hidden"
                      animate={{ height: "auto" }}
                    >
                      <div className="hidden group-hover:block transition-all duration-300">
                        <div className="flex flex-wrap gap-1 mb-2 pt-2 border-t border-border/30">
                          {node.metadata?.horizons && Array.isArray(node.metadata.horizons) && node.metadata.horizons.map((h: number) => (
                            <span key={h} className="text-[9px] px-1.5 py-0.5 rounded-full bg-celestial-neon/20 text-celestial-neon border border-celestial-neon/30 font-mono">
                              H{h}
                            </span>
                          ))}
                          {node.metadata?.tech && Array.isArray(node.metadata.tech) && node.metadata.tech.map((t: string) => (
                            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted border border-border text-muted-foreground font-mono">
                              {t}
                            </span>
                          ))}
                        </div>
                        
                        {node.metadata?.description && (
                           <p className="text-[10px] text-muted-foreground font-mono leading-relaxed mb-2 line-clamp-3">
                             {node.metadata.description}
                           </p>
                        )}

                        {node.metadata?.goal && (
                          <div className="p-2 rounded bg-celestial-gold/5 border border-celestial-gold/10">
                            <p className="text-[9px] text-celestial-gold font-mono leading-tight flex items-center gap-2">
                               <Sparkles className="w-3 h-3" />
                               GOAL: {node.metadata.goal}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
          <Zap className="w-3 h-3 text-celestial-neon" />
          Conselho dos Agentes | {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>
    </div>
  )
}
