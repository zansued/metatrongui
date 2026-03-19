import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, Wrench, Server, Database, FolderGit2, 
  Network, Blocks, Globe, Layers, Monitor, 
  Sparkles, Zap, ChevronRight, Info 
} from 'lucide-react'
import { Skeleton } from '@vibe/core'
import { KnowledgeService, KnowledgeNode } from '../../services/knowledge'
import MetatronTipseen from './MetatronTipseen'
import { METATRON_LAWS } from '../../core/Nucleus'

const getNodeConfig = (type: string) => {
  const normalizedType = (type || '').toUpperCase()
  switch (normalizedType) {
    case 'CONCEPT': return { icon: Brain, color: 'text-purple-400', border: 'border-purple-500/30', glow: 'shadow-purple-500/20' }
    case 'TOOL': return { icon: Wrench, color: 'text-orange-400', border: 'border-orange-500/30', glow: 'shadow-orange-500/20' }
    case 'SERVER': return { icon: Server, color: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-blue-500/20' }
    case 'DATABASE': return { icon: Database, color: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' }
    case 'ORCHESTRATOR': return { icon: Network, color: 'text-rose-400', border: 'border-rose-500/30', glow: 'shadow-rose-500/20' }
    case 'INTERFACE': return { icon: Monitor, color: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20' }
    default: return { icon: Blocks, color: 'text-slate-400', border: 'border-slate-500/30', glow: 'shadow-slate-500/20' }
  }
}

export function RegistryPanel() {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([])
  const [loading, setLoading] = useState(true)

  const loadNodes = async () => {
    setLoading(true)
    const data = await KnowledgeService.fetchNodes()
    setNodes(data)
    setLoading(false)
  }

  useEffect(() => {
    loadNodes()

    const handleNodeUpdate = () => loadNodes()
    window.addEventListener('metatron-node-update', handleNodeUpdate)
    return () => window.removeEventListener('metatron-node-update', handleNodeUpdate)
  }, [])

  return (
    <div className="h-full flex flex-col bg-card/30 backdrop-blur-md border-l border-border/50">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <MetatronTipseen content={<span className="text-xs">O Livro de Metatron registra todos os nodos de conhecimento tecidos pelo Mestre.</span>}>
            <div className="flex items-center gap-2 cursor-help">
              <div className="w-8 h-8 rounded-lg bg-celestial-neon/10 border border-celestial-neon/30 flex items-center justify-center">
                <Globe className="w-5 h-5 text-celestial-neon animate-pulse" />
              </div>
              <h2 className="text-sm font-bold tracking-tighter text-foreground uppercase">Metatron Book</h2>
            </div>
          </MetatronTipseen>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest border-b border-emerald-500/30">Sincrone</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/30 p-2 rounded-lg border border-border/50">
            <span className="text-[9px] font-mono text-muted-foreground block uppercase">Nodos Totais</span>
            <span className="text-lg font-bold text-celestial-neon font-mono">{nodes.length}</span>
          </div>
          <div className="bg-muted/30 p-2 rounded-lg border border-border/50">
            <span className="text-[9px] font-mono text-muted-foreground block uppercase">Entropia</span>
            <span className="text-lg font-bold text-celestial-gold font-mono">0.02</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-3 rounded-xl border border-border/30 bg-muted/10 space-y-2">
                <div className="flex justify-between items-start">
                  <Skeleton width={100} height={16} />
                  <Skeleton width={20} height={20} />
                </div>
                <Skeleton width={180} height={40} />
              </div>
            ))}
          </div>
        ) : nodes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
            <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-xs font-mono italic">Nenhum rastro de conhecimento detectado nas Linhas de Ley.</p>
          </div>
        ) : (
          <AnimatePresence>
            {nodes.map((node, idx) => {
              const config = getNodeConfig(node.type)
              return (
                <motion.div
                  key={node.id || idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`group relative p-3 rounded-xl border ${config.border} bg-muted/5 hover:bg-muted/10 transition-all cursor-pointer ${config.glow}`}
                >
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg bg-background/50 border ${config.border}`}>
                          <config.icon className={`w-3.5 h-3.5 ${config.color}`} />
                        </div>
                        <span className="text-xs font-bold text-foreground truncate max-w-[120px]">
                          {node.name}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-celestial-neon transition-colors" />
                    </div>
                    
                    {node.metadata?.description && (
                      <p className="text-[10px] text-muted-foreground font-mono leading-relaxed mb-2 max-h-32 overflow-y-auto custom-scrollbar italic whitespace-pre-wrap">
                        {node.metadata.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/40 border border-border/50">
                        <Zap className={`w-2.5 h-2.5 ${config.color}`} />
                        <span className="text-[9px] font-mono uppercase text-muted-foreground">
                          {node.type}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground/50">
                        {node.created_at ? new Date(node.created_at).toLocaleDateString() : 'REALTIME'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      <div className="p-4 border-t border-border/50 bg-muted/20">
        <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground mb-2">
          <Info className="w-3 h-3" />
          <span>STATUS DO LEDGER</span>
        </div>
        <div className="w-full bg-background/40 h-1.5 rounded-full overflow-hidden border border-border/50 mb-4">
          <motion.div 
            className="h-full bg-celestial-neon shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (nodes.length / 50) * 100)}%` }}
          />
        </div>

        {/* Metatron Laws Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[9px] font-mono text-celestial-gold">
            <Sparkles className="w-3 h-3" />
            <span>LEIS DE METATRON</span>
          </div>
          {METATRON_LAWS.map(law => (
            <div key={law.id} className="text-[8px] font-mono text-muted-foreground/80 leading-tight">
              <span className="text-celestial-gold opacity-60">RULE_{law.id}:</span> {law.description}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
