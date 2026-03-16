/**
 * NeuralVoice Service
 * TTS via Pollinations API (gen.pollinations.ai) with in-memory cache
 */

import { POLLINATIONS_CONFIG } from '../../config/pollinations';

export interface TTSOptions {
  voice?: string;
  model?: string;
  speed?: number;
}

// Simple hash for cache keys
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

// Strip markdown for cleaner TTS
function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')        // code blocks
    .replace(/`([^`]+)`/g, '$1')           // inline code
    .replace(/#{1,6}\s+/g, '')             // headers
    .replace(/\*\*([^*]+)\*\*/g, '$1')     // bold
    .replace(/\*([^*]+)\*/g, '$1')         // italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/^[\s]*[-*+]\s+/gm, '')       // list markers
    .replace(/^[\s]*\d+\.\s+/gm, '')       // numbered lists
    .replace(/\n{2,}/g, '. ')              // multiple newlines
    .replace(/\n/g, ' ')                   // single newlines
    .trim();
}

const CACHE_LIMIT = 100;

class NeuralVoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private cache = new Map<string, Blob>();

  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    const cleaned = stripMarkdown(text).slice(0, 200);
    if (!cleaned) return;

    // Small delay to avoid hitting rate limits right after chat API call
    await new Promise(r => setTimeout(r, 1500));

    // Stop any playing audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    window.speechSynthesis.cancel();

    const voice = options.voice || POLLINATIONS_CONFIG.defaultVoice;
    const speed = options.speed || 1;
    const cacheKey = simpleHash(`${cleaned}|${voice}|${speed}`);

    try {
      let audioBlob = this.cache.get(cacheKey);

      if (!audioBlob) {
        console.log('[NeuralVoice] Requesting TTS:', { voice, speed, textLength: cleaned.length });

        const maxRetries = 4;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          // Wait before request on retries (exponential backoff)
          if (attempt > 0) {
            const waitMs = Math.min(3000 * Math.pow(2, attempt - 1), 15000);
            console.warn(`[NeuralVoice] Rate limited, waiting ${waitMs}ms before retry ${attempt + 1}/${maxRetries}`);
            await new Promise(r => setTimeout(r, waitMs));
          }

          const res = await fetch(POLLINATIONS_CONFIG.ttsUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: POLLINATIONS_CONFIG.defaultTtsModel,
              input: cleaned,
              voice: voice,
              speed: speed,
              response_format: 'mp3',
            }),
          });

          if (res.status === 429) {
            console.warn(`[NeuralVoice] Rate limited (429) attempt ${attempt + 1}/${maxRetries}`);
            continue;
          }

          if (!res.ok) {
            const errText = await res.text().catch(() => '');
            throw new Error(`TTS API ${res.status}: ${errText}`);
          }
          audioBlob = await res.blob();
          console.log('[NeuralVoice] Got audio blob:', audioBlob.size, 'bytes, type:', audioBlob.type);

          if (audioBlob.size < 100) {
            throw new Error('Audio blob too small, likely empty response');
          }
          break;
        }

        if (!audioBlob) {
          throw new Error('TTS API rate limited after retries');
        }

        // FIFO eviction
        if (this.cache.size >= CACHE_LIMIT) {
          const firstKey = this.cache.keys().next().value;
          if (firstKey) this.cache.delete(firstKey);
        }
        this.cache.set(cacheKey, audioBlob);
      }

      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      this.currentAudio = audio;
      audio.onerror = (e) => {
        console.error('[NeuralVoice] Audio playback error:', e);
        URL.revokeObjectURL(url);
      };
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (this.currentAudio === audio) this.currentAudio = null;
      };
      await audio.play();
      console.log('[NeuralVoice] Playing audio successfully');
    } catch (error) {
      console.warn('[NeuralVoice] API failed, using fallback:', error);
      this.fallbackSpeak(cleaned, options);
    }
  }

  private fallbackSpeak(text: string, options: TTSOptions) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = options.speed || 1;
    utterance.pitch = 0.8;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      v => (v.name.includes('Google') || v.name.includes('Microsoft')) && v.lang.startsWith('pt')
    );
    if (preferred) utterance.voice = preferred;

    window.speechSynthesis.speak(utterance);
  }

  async startRecording(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];
    this.mediaRecorder.ondataavailable = (e) => this.audioChunks.push(e.data);
    this.mediaRecorder.start();
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) return reject('Recorder not initialized');
      this.mediaRecorder.onstop = () => {
        resolve(new Blob(this.audioChunks, { type: 'audio/mpeg' }));
      };
      this.mediaRecorder.stop();
    });
  }

  async transcribe(_audioBlob: Blob): Promise<string> {
    return "Transcrição via Whisper requer o backend API.";
  }
}

export const neuralVoice = new NeuralVoiceService();
