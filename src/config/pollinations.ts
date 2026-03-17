// Pollinations API Configuration
// pk_ keys are publishable and safe for client-side use
export const POLLINATIONS_CONFIG = {
  // Text/Chat API - dedicated key for chat
  chatApiKey: 'pk_I6lTuBKJ326jJFcZ',
  // Audio/TTS API - separate key for voice
  audioApiKey: 'pk_2cueuCWWGjiEDwj5',
  baseUrl: 'https://gen.pollinations.ai',
  textUrl: 'https://gen.pollinations.ai/v1/chat/completions',
  ttsUrl: 'https://gen.pollinations.ai/v1/audio/speech',
  defaultVoice: 'ash',
  defaultChatModel: 'gemini-fast',
  defaultTtsModel: 'elevenlabs',
} as const;
