import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabasePortal'
import { motion, AnimatePresence } from 'framer-motion'
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
  Info
} from 'lucide-react'

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
    default: return { icon: Sparkles, color: 'text-celestial-gold', border: 'border-celestial-gold/30', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.2)]' }
  }
}

interface KnowledgeNode {
  id: string;
  name: string;
  type: string;
  metadata?: any;
  created_at: string;
}

export function RegistryPanel() {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const { data, error } = await supabase.from('geminicli_knowledge_nodes').select('*').order('created_at', { ascending: false })
        if (error) {
          console.error('[RegistryPanel] Supabase error:', error.message)
        }
        if (data) {
          setNodes(data)
        }
      } catch (err) {
        console.error('[RegistryPanel] Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchNodes()

    const channel = supabase.channel('registry-sync-v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'geminicli_knowledge_nodes' }, fetchNodes)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="relative flex flex-col h-full bg-card/50 backdrop-blur-sm border-l border-border overflow-hidden">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 bg-gradient-to-b from-celestial-neon/5 via-transparent to-celestial-gold/5 pointer-events-none" />

      {/* Header Section */}
      <div className="relative p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground tracking-tight">Metatron Book</h2>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-celestial-neon/10 text-celestial-neon rounded-full border border-celestial-neon/20">
            LIVE SYNC
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Conhecimento tecendo a realidade.</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse border border-border" />
          ))
        ) : nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Sparkles className="w-8 h-8 mb-2 text-celestial-neon opacity-50" />
            <p className="text-xs font-mono">Nenhum nó registrado</p>
            <p className="text-[10px] mt-1 opacity-60">Aguardando sincronia...</p>
          </div>
        ) : (
          <AnimatePresence>
            {nodes.map((node, index) => {
              const { icon: Icon, color, border, glow } = getNodeConfig(node.type)

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative group cursor-pointer rounded-xl ${border} border bg-card/80 backdrop-blur-sm hover:bg-card transition-all overflow-hidden ${glow} shadow-lg`}
                >
                  {/* Card Body */}
                  <div className="relative p-3">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-lg ${color} bg-current/10 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>

                      {/* Status Beacon */}
                      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-celestial-neon animate-pulse" />

                      {/* Info Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono mb-0.5">
                          #{String(node.id).slice(0, 4)}
                        </div>
                        <h3 className="text-sm font-semibold text-foreground truncate">{node.name}</h3>
                        <span className={`text-[10px] font-mono ${color}`}>{node.type}</span>
                        
                        {node.metadata?.description && (
                          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                            {node.metadata.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                      <span>{new Date(node.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Info className="w-3 h-3" />
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Hover reveal - extra metadata */}
                    <div className="mt-2 max-h-0 group-hover:max-h-24 overflow-hidden transition-all">
                      {node.metadata?.skills && Array.isArray(node.metadata.skills) && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {node.metadata.skills.slice(0, 4).map((skill: string, i: number) => (
                            <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded-full border ${border} ${color} font-mono`}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      {node.metadata?.architecture && (
                        <p className="text-[9px] text-muted-foreground font-mono">🏗️ {node.metadata.architecture}</p>
                      )}
                      {node.metadata?.domain && (
                        <p className="text-[9px] text-muted-foreground font-mono">🌐 {node.metadata.domain}</p>
                      )}
                      {!node.metadata?.description && !node.metadata?.skills && !node.metadata?.architecture && !node.metadata?.domain && (
                        <p className="text-[10px] text-celestial-neon font-mono">Sincronia: 100% (Metatron Ledger)</p>
                      )}
                    </div>
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
