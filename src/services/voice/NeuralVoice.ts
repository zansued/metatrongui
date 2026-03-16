/**
 * NeuralVoice Service
 * TTS via Pollinations API (gen.pollinations.ai) with in-memory cache
 */

import { POLLINATIONS_CONFIG } from '../config/pollinations';

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
    const cleaned = stripMarkdown(text).slice(0, 800);
    if (!cleaned) return;

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
        const res = await fetch(POLLINATIONS_CONFIG.ttsUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${POLLINATIONS_CONFIG.apiKey}`,
          },
          body: JSON.stringify({
            model: POLLINATIONS_CONFIG.defaultTtsModel,
            input: cleaned,
            voice: voice,
            speed: speed,
            response_format: 'mp3',
          }),
        });

        if (!res.ok) throw new Error(`TTS API ${res.status}`);
        audioBlob = await res.blob();

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
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (this.currentAudio === audio) this.currentAudio = null;
      };
      await audio.play();
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
