/**
 * NeuralVoice Service
 * Handles text-to-speech using browser's SpeechSynthesis API
 */

export interface TTSOptions {
  voice?: string;
  model?: string;
  speed?: number;
}

class NeuralVoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    try {
      // Use Browser's SpeechSynthesis
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = options.speed || 1;

      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium'));
      if (premiumVoice) utterance.voice = premiumVoice;

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('[NeuralVoice] Speech synthesis failed:', error);
    }
  }

  async startRecording(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      this.audioChunks.push(event.data);
    };

    this.mediaRecorder.start();
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) return reject('Recorder not initialized');

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/mpeg' });
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  async transcribe(_audioBlob: Blob): Promise<string> {
    // Whisper API not available without backend
    return "Transcrição via Whisper requer o backend API.";
  }
}

export const neuralVoice = new NeuralVoiceService();
