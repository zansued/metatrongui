import { useState, useCallback, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Zap, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { neuralVoice } from '../../services/voice/NeuralVoice';

interface VoiceInterfaceProps {
  onTranscript?: (text: string) => void;
  onCommand?: (command: string) => void;
  isListening?: boolean;
  className?: string;
}

const VoiceInterface = ({ onCommand, className = '' }: VoiceInterfaceProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isRecordingWhisper, setIsRecordingWhisper] = useState(false);
  const [isWhisperEnabled, setIsWhisperEnabled] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [voiceHistory, setVoiceHistory] = useState<string[]>([]);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Try to use native SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'pt-BR';
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          final += event.results[i][0].transcript;
        }
        setTranscript(final);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setVoiceHistory(prev => ['❌ Navegador não suporta reconhecimento de voz', ...prev.slice(0, 9)]);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
    }
  }, [isListening]);

  const handleManualSend = useCallback(() => {
    if (transcript && transcript.trim().length > 1) {
      onCommand?.(transcript.trim());
      setVoiceHistory(prev => [`🎯 Enviado: ${transcript.trim().substring(0, 30)}...`, ...prev.slice(0, 9)]);
      setTranscript('');
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  }, [transcript, onCommand, isListening]);

  const toggleWhisperRecording = useCallback(async () => {
    if (isRecordingWhisper) {
      setIsRecordingWhisper(false);
      try {
        const audioBlob = await neuralVoice.stopRecording();
        setVoiceHistory(prev => ['🌀 Processando via Whisper...', ...prev.slice(0, 9)]);
        const text = await neuralVoice.transcribe(audioBlob);
        if (text) onCommand?.(text);
      } catch {
        setVoiceHistory(prev => ['❌ Erro no Whisper', ...prev.slice(0, 9)]);
      }
    } else {
      try {
        await neuralVoice.startRecording();
        setIsRecordingWhisper(true);
      } catch {
        setVoiceHistory(prev => ['❌ Permissão Negada (Mic)', ...prev.slice(0, 9)]);
      }
    }
  }, [isRecordingWhisper, onCommand]);

  const browserSupported = !!(((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));

  if (!browserSupported) {
    return (
      <div className={`text-muted-foreground text-xs text-center p-4 ${className}`}>
        Navegador não suporta reconhecimento de voz
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={isWhisperEnabled ? toggleWhisperRecording : toggleListening}
          className={`relative p-3 rounded-xl transition-all ${
            (isListening || isRecordingWhisper)
              ? 'bg-celestial-neon/20 border border-celestial-neon/50 text-celestial-neon glow-neon'
              : 'bg-muted border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {isRecordingWhisper ? (
            <Radio className="w-5 h-5 animate-pulse" />
          ) : (
            isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />
          )}
          {(isListening || isRecordingWhisper) && (
            <motion.span
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-xl border border-celestial-neon/30"
            />
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
              Ritual de Voz
              {isWhisperEnabled && <span className="text-[10px] px-1.5 py-0.5 bg-accent/20 text-accent rounded">WHISPER</span>}
            </h4>
            <span className={`text-[10px] font-mono ${(isListening || isRecordingWhisper) ? 'text-celestial-neon' : 'text-muted-foreground'}`}>
              {(isListening || isRecordingWhisper) ? 'SINTONIZADO' : 'AGUARDANDO'}
            </span>
          </div>
        </div>

        {/* Whisper Toggle */}
        <button
          onClick={() => setIsWhisperEnabled(!isWhisperEnabled)}
          className={`p-2 rounded-lg transition-all border ${
            isWhisperEnabled
              ? 'bg-accent/20 border-accent/50 text-accent'
              : 'bg-muted border-border text-muted-foreground hover:text-foreground'
          }`}
          title="Ativar Whisper Tunnel"
        >
          <Zap className="w-4 h-4" />
        </button>

        {/* Send Button */}
        <button
          onClick={handleManualSend}
          disabled={!transcript || transcript.trim().length < 2}
          className="p-2 rounded-lg bg-celestial-neon/20 border border-celestial-neon/30 text-celestial-neon hover:bg-celestial-neon/40 disabled:opacity-20 transition-all"
          title="Enviar Comando"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Transcript */}
      <div className="bg-muted/50 rounded-lg p-2 border border-border">
        <p className="text-xs text-muted-foreground font-mono">
          {isRecordingWhisper
            ? "Sintonizando Whisper Tunnel... Fale agora."
            : (transcript || (isListening ? "Metatron escuta suas frequências..." : "As Linhas de Ley aguardam o Mestre."))}
        </p>

        <AnimatePresence>
          {(isListening || isRecordingWhisper) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-0.5 mt-2 h-4 items-end"
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [4, Math.random() * 16 + 4, 4] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                  className="w-1 bg-celestial-neon/60 rounded-full"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* History */}
      <div className="space-y-1 max-h-20 overflow-y-auto">
        {voiceHistory.map((entry, i) => (
          <p key={i} className="text-[10px] text-muted-foreground font-mono truncate">
            {entry}
          </p>
        ))}
      </div>

      {/* Volume Slider */}
      <div className="flex items-center gap-2">
        <Volume2 className="w-3 h-3 text-muted-foreground" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>
    </div>
  );
};

export default VoiceInterface;
