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
const CHUNK_SIZE = 450; // chars per chunk — safe for URL length

// Split text into chunks at sentence boundaries
function splitIntoChunks(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining.trim());
      break;
    }

    // Find last sentence boundary within maxLen
    let splitAt = -1;
    for (const sep of ['. ', '! ', '? ', '; ', ', ']) {
      const idx = remaining.lastIndexOf(sep, maxLen);
      if (idx > 0 && idx > splitAt) splitAt = idx + sep.length;
    }
    // Fallback: split at last space
    if (splitAt <= 0) {
      splitAt = remaining.lastIndexOf(' ', maxLen);
    }
    if (splitAt <= 0) splitAt = maxLen;

    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  return chunks.filter(c => c.length > 0);
}

class NeuralVoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private cache = new Map<string, Blob>();
  private isStopped = false;

  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    const cleaned = stripMarkdown(text);
    if (!cleaned) return;

    this.stop();
    this.isStopped = false;

    await new Promise(r => setTimeout(r, 1000));

    const chunks = splitIntoChunks(cleaned, CHUNK_SIZE);
    console.log(`[NeuralVoice] Split into ${chunks.length} chunks`);

    // Prefetch first two chunks in parallel
    const prefetchQueue = new Map<number, Promise<Blob | null>>();
    const prefetch = (idx: number) => {
      if (idx < chunks.length && !prefetchQueue.has(idx)) {
        prefetchQueue.set(idx, this.fetchChunkAudio(chunks[idx], options).catch(err => {
          console.warn(`[NeuralVoice] Prefetch ${idx} failed:`, err);
          return null;
        }));
      }
    };

    // Start prefetching chunk 0 and 1 immediately
    prefetch(0);
    prefetch(1);

    for (let i = 0; i < chunks.length; i++) {
      if (this.isStopped) break;

      console.log(`[NeuralVoice] Playing chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`);

      // Prefetch next chunk while current plays
      prefetch(i + 1);
      prefetch(i + 2);

      try {
        const blob = await prefetchQueue.get(i);
        if (!blob) {
          throw new Error('Prefetch returned null');
        }
        await this.playBlob(blob);
      } catch (error) {
        console.warn(`[NeuralVoice] Chunk ${i + 1} failed, using fallback:`, error);
        this.fallbackSpeak(chunks.slice(i).join(' '), options);
        break;
      }

      if (i < chunks.length - 1 && !this.isStopped) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
  }

  stop() {
    this.isStopped = true;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    window.speechSynthesis.cancel();
  }

  private async playChunk(text: string, options: TTSOptions): Promise<void> {
    const voice = options.voice || POLLINATIONS_CONFIG.defaultVoice;
    const speed = options.speed || 1.15;
    const cacheKey = simpleHash(`${text}|${voice}|${speed}`);

    let audioBlob = this.cache.get(cacheKey);

    if (!audioBlob) {
      const encodedText = encodeURIComponent(text);
      const ttsGetUrl = `https://gen.pollinations.ai/audio/${encodedText}?voice=${voice}&model=${POLLINATIONS_CONFIG.defaultTtsModel}&key=${POLLINATIONS_CONFIG.audioApiKey}`;

      const maxRetries = 3;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (this.isStopped) return;
        if (attempt > 0) {
          const waitMs = Math.min(3000 * Math.pow(2, attempt - 1), 12000);
          console.warn(`[NeuralVoice] Retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(r => setTimeout(r, waitMs));
        }

        const res = await fetch(ttsGetUrl);

        if (res.status === 429) {
          console.warn(`[NeuralVoice] Rate limited (429) attempt ${attempt + 1}/${maxRetries}`);
          continue;
        }

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          throw new Error(`TTS API ${res.status}: ${errText}`);
        }
        audioBlob = await res.blob();

        if (audioBlob.size < 100) {
          throw new Error('Audio blob too small');
        }
        break;
      }

      if (!audioBlob) throw new Error('TTS rate limited after retries');

      // FIFO eviction
      if (this.cache.size >= CACHE_LIMIT) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) this.cache.delete(firstKey);
      }
      this.cache.set(cacheKey, audioBlob);
    }

    // Play and wait for completion
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(audioBlob!);
      const audio = new Audio(url);
      this.currentAudio = audio;
      audio.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (this.currentAudio === audio) this.currentAudio = null;
        resolve();
      };
      audio.play().catch(reject);
    });
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
