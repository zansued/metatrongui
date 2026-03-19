import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Send, Command, Bot, User, Code, Activity } from 'lucide-react'
import { VoiceLoader } from './VoiceLoader'
import { chatWithMetatron } from '../../services/deepseek'
import { BoltParser, Artifact } from '../../utils/BoltParser'
import { supabase } from '../../lib/supabasePortal'
import VoiceInterface from './VoiceInterface'
import { useVoiceCommands } from '../../hooks/useVoiceCommands'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { neuralVoice } from '../../services/voice/NeuralVoice'

interface RealtimeLog {
  type: 'info' | 'success' | 'stdout' | 'stderr'
  message: string
}

interface Message {
  role: 'metatron' | 'user'
  content: string
  timestamp: Date
  artifacts?: Artifact[]
  logs?: RealtimeLog[]
}

export function RitualConsole() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'metatron', content: 'As Linhas de Ley estão sintonizadas. Posso criar ou modificar minha própria interface para você. O que deseja tecer hoje, Mestre?', timestamp: new Date() }
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const [loadingText, setLoadingText] = useState("MEDITANDO")
  const [nodes, setNodes] = useState<KnowledgeNode[]>([])
  const [currentLogs, setCurrentLogs] = useState<RealtimeLog[]>([])
  const [isVoiceOpen, setIsVoiceOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch initial nodes from Supabase
    const fetchNodes = async () => {
      try {
        const { data } = await supabase.from('geminicli_knowledge_nodes').select('*')
        if (data) setNodes(data)
      } catch (e) {
        console.log('[Metatron] Supabase fetch skipped:', e)
      }
    }
    fetchNodes()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentLogs]);

  const executeArtifacts = async (artifacts: Artifact[]) => {
    setCurrentLogs([]);
    for (const artifact of artifacts) {
      setLoadingText(`CONSTRUINDO: ${artifact.title.toUpperCase()}`)
      for (const action of artifact.actions) {
        try {
          await fetch('/api/metatron-action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action)
          })
        } catch (e) {
          console.error('[Metatron Action] Falha na execução:', e)
        }
      }
    }
  };

  const { processText } = useVoiceCommands((cmd) => {
    if (cmd === 'clear' || cmd === 'resetar' || cmd === 'nova conversa') {
      resetConversation();
    } else {
      setInput(cmd);
      handleSendDirect(cmd);
    }
  });

  const resetConversation = () => {
    setMessages([{
      role: 'metatron',
      content: 'As Linhas de Ley foram redefinidas. Uma nova tecelagem começa agora, Mestre. O que deseja criar?',
      timestamp: new Date()
    }]);
    setCurrentLogs([]);
    setIsProcessing(false);
    window.speechSynthesis.cancel();
  };

  const handleSendDirect = async (overrideValue?: string) => {
    const value = overrideValue || input;
    if (!value.trim() || isProcessing) return

    const userMsg: Message = { role: 'user', content: value, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsProcessing(true)
    setLoadingText("MEDITANDO")
    setCurrentLogs([]);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithMetatron(value, nodes, history)
      const artifacts = BoltParser.parse(response);

      if (artifacts.length > 0) {
        await executeArtifacts(artifacts);
<<<<<<< Updated upstream
        setMessages(prev => [...prev, {
          role: 'metatron',
          content: 'As Runas foram tecidas com sucesso. O fluxo de dados está em tempo real.',
=======
        
        // Auto-persist knowledge nodes for each artifact
        let savedCount = 0;
        for (const artifact of artifacts) {
          const newNode: KnowledgeNode = {
            name: artifact.title,
            type: artifact.title.toLowerCase().includes('serv') ? 'SERVER' : 
                  artifact.title.toLowerCase().includes('db') || artifact.title.toLowerCase().includes('banco') ? 'DATABASE' :
                  artifact.title.toLowerCase().includes('ui') || artifact.title.toLowerCase().includes('interface') ? 'INTERFACE' : 'ORCHESTRATOR',
            metadata: {
              description: `Artefato tecido em: ${new Date().toLocaleString('pt-BR')}`,
              goal: value.slice(0, 100)
            }
          }
          const saved = await KnowledgeService.saveNode(newNode)
          if (saved) savedCount++;
        }

        const successContent = savedCount > 0 
          ? `As Runas foram tecidas com sucesso. ${savedCount} nodo(s) registrado(s) no Ledger.`
          : 'As Runas foram tecidas, mas houve uma falha na sincronia com o Ledger (Verifique a conexão).';

        setMessages(prev => [...prev, {
          role: 'metatron',
          content: successContent,
>>>>>>> Stashed changes
          timestamp: new Date(),
          artifacts,
          logs: currentLogs
        }]);
        neuralVoice.speak(successContent);
      } else {
        setMessages(prev => [...prev, { role: 'metatron', content: response, timestamp: new Date() }])
        neuralVoice.speak(response);
      }

    } catch (error) {
      console.error('Erro no chat:', error)
      setMessages(prev => [...prev, { role: 'metatron', content: 'Erro na conexão neural.', timestamp: new Date() }])
    } finally {
      setIsProcessing(false)
    }
  };

  const handleSend = () => handleSendDirect();

  return (
    <div className="flex flex-col h-full bg-card/30 backdrop-blur-sm">
      {/* Header */}
      <div className="relative p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-celestial-neon" />
            <h1 className="text-lg font-bold text-foreground tracking-tight">Console de Ritual</h1>
          </div>
          <button
            onClick={resetConversation}
            className="text-xs font-mono px-3 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
          >
            Nova Conversa
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                m.role === 'metatron'
                  ? 'bg-celestial-neon/20 border border-celestial-neon/30'
                  : 'bg-celestial-gold/20 border border-celestial-gold/30'
              }`}>
                {m.role === 'metatron' ? <Bot className="w-4 h-4 text-celestial-neon" /> : <User className="w-4 h-4 text-celestial-gold" />}
              </div>

              <div className={`flex-1 max-w-[80%] ${m.role === 'user' ? 'text-right' : ''}`}>
                {/* Message Content with Markdown */}
                <div className={`rounded-xl p-3 ${
                  m.role === 'metatron'
                    ? 'bg-muted/50 border border-border'
                    : 'bg-celestial-gold/10 border border-celestial-gold/20'
                }`}>
                  <div className="prose-celestial text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>

                {m.artifacts && m.artifacts.map((artifact, j) => (
                  <div key={j} className="mt-2 rounded-lg border border-celestial-neon/20 bg-celestial-neon/5 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Code className="w-3 h-3 text-celestial-neon" />
                      <span className="text-xs font-mono text-celestial-neon">{artifact.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-accent">AUTOPRESERVAÇÃO</span>
                  </div>
                ))}

                <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground font-mono">
                  <span>{m.role === 'metatron' ? 'LEY LINE TRANSMISSION' : 'MASTER SIGNATURE'}</span>
                  <span>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading */}
        <VoiceLoader isActive={isProcessing} text={loadingText} size={120} />

        {/* Realtime Stream Panel */}
        {currentLogs.length > 0 && (
          <div className="bg-muted/30 rounded-lg border border-border p-3">
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-celestial-neon">
              <Activity className="w-3 h-3" />
              FLUXO DE DADOS EM TEMPO REAL
            </div>
            {currentLogs.map((log, idx) => (
              <div key={idx} className="text-[10px] font-mono text-muted-foreground">
                <span className="text-celestial-neon/60">
                  [{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                </span>
                {' '}{log.message}
              </div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center gap-2 bg-muted/50 rounded-xl border border-border p-2">
          <button
            onClick={() => setIsVoiceOpen(!isVoiceOpen)}
            className={`p-2 rounded-lg transition-all ${isVoiceOpen ? 'bg-celestial-neon/20 text-celestial-neon' : 'text-muted-foreground hover:text-foreground'}`}
            title="Alternar Interface de Voz"
          >
            <Command className="w-4 h-4" />
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Comande o Metatron (ex: 'teça um componente de áudio')..."
            disabled={isProcessing}
            className="flex-1 bg-transparent border-none outline-none text-foreground font-medium placeholder:text-muted-foreground py-2 text-sm disabled:opacity-50"
          />

          <button
            onClick={handleSend}
            disabled={isProcessing || !input.trim()}
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Voice Interface */}
        <AnimatePresence>
          {isVoiceOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-muted/30 rounded-xl border border-border p-3 overflow-hidden"
            >
              <VoiceInterface
                onCommand={(cmd) => {
                  const processed = processText(cmd);
                  if (!processed) {
                    handleSendDirect(cmd);
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
