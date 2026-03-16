// Pollinations API Configuration
// pk_ keys are publishable and safe for client-side use
export const POLLINATIONS_CONFIG = {
  apiKey: 'sk_HdF80dCfDLEOtmA0gMAzWlaKScTOqERq',
  baseUrl: 'https://gen.pollinations.ai',
  textUrl: 'https://gen.pollinations.ai/v1/chat/completions',
  ttsUrl: 'https://gen.pollinations.ai/v1/audio/speech',
  defaultVoice: 'alloy',
  defaultChatModel: 'openai',
  defaultTtsModel: 'elevenlabs',
} as const;
