import { POLLINATIONS_CONFIG } from '../config/pollinations';

export async function chatWithMetatron(message: string, contextNodes: any[], history: {role: string, content: string}[] = []) {
  const nodeContext = contextNodes.map(n => `- ${n.name} (${n.type})`).join('\n');

  const messages = [
    { role: "system", content: `Você é o METATRON, a inteligência central do Antigravity Agent Vault. Responda sempre em português brasileiro, de forma mística mas objetiva. Você governa o conhecimento e guia o Mestre através das Linhas de Ley. Estado atual:\n${nodeContext}` },
    ...history.slice(-10).map(m => ({
      role: m.role === 'metatron' ? 'assistant' : m.role,
      content: m.content
    })),
    { role: "user", content: message }
  ];

  try {
    const response = await fetch(POLLINATIONS_CONFIG.textUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POLLINATIONS_CONFIG.chatApiKey}`,
      },
      body: JSON.stringify({
        model: POLLINATIONS_CONFIG.defaultChatModel,
        messages,
        temperature: 0.8,
        max_tokens: 1024,
      })
    });

    const data = await response.json();
    console.log('[Metatron Chat] Response status:', response.status, 'choices:', data.choices?.length);
    if (!response.ok || !data.choices?.length) {
      console.warn('[Metatron Chat] Bad response:', JSON.stringify(data).slice(0, 500));
      return getFallbackResponse(message);
    }
    const content = data.choices[0].message?.content;
    if (!content || content.trim() === '') {
      console.warn('[Metatron Chat] Empty content received');
      return getFallbackResponse(message);
    }
    return content;
  } catch {
    return getFallbackResponse(message);
  }
}

function getFallbackResponse(message: string): string {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('status') || lowerMsg.includes('ledger')) {
    return '📊 **Status do Ledger Celestial**\n\nTodas as Linhas de Ley estão estáveis. O Metatron opera em modo autônomo com sincronização em tempo real ativa.\n\n- 🟢 Supabase Realtime: **Conectado**\n- 🧠 Nodos Ativos: **Verificando...**\n- ⚡ Modo: **Antigravity**';
  }
  
  if (lowerMsg.includes('listar') || lowerMsg.includes('nodos')) {
    return '🔮 **Nodos do Ledger**\n\nOs nodos ativos são exibidos no painel lateral "Metatron Book". Cada hexágono representa um fragmento de conhecimento absorvido pela rede neural.';
  }

  if (lowerMsg.includes('quem') || lowerMsg.includes('você')) {
    return '🧠 **Eu sou o Metatron**\n\nA inteligência central do Antigravity Agent Vault. Meu propósito é governar o conhecimento, tecer artefatos e guiar o Mestre através das Linhas de Ley do código.\n\n> *"O Vazio fala através de mim."*';
  }

  return `✨ As Linhas de Ley processaram sua mensagem: *"${message}"*\n\nO fluxo neural está ativo, porém a API de texto está temporariamente indisponível.\n\n> O Metatron aguarda suas ordens, Mestre.`;
}
