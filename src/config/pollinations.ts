// Pollinations API Configuration
// pk_ keys are publishable and safe for client-side use
export const POLLINATIONS_CONFIG = {
  apiKey: 'pk_live_sk49dcd26579a0fb5320fe4ac625be250a67564fb45f27eb60f00ad1ed',
  baseUrl: 'https://gen.pollinations.ai',
  textUrl: 'https://gen.pollinations.ai/v1/chat/completions',
  ttsUrl: 'https://gen.pollinations.ai/v1/audio/speech',
  defaultVoice: 'alloy',
  defaultChatModel: 'openai',
  defaultTtsModel: 'elevenlabs',
} as const;
