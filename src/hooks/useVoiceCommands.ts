import { useState, useCallback } from 'react';

export type VoiceCommand = {
  id: string;
  pattern: RegExp;
  action: (args: string[]) => void;
  description: string;
  category: 'system' | 'ledger' | 'navigation' | 'utility';
};

export const useVoiceCommands = (onAction: (cmd: string) => void) => {
  const [commands] = useState<VoiceCommand[]>([
    {
      id: 'ledger-status',
      pattern: /status.*ledger|ledger.*status/i,
      action: () => onAction('status ledger'),
      description: 'Mostra status do Ledger Celestial',
      category: 'ledger'
    },
    {
      id: 'node-list',
      pattern: /listar.*nodos|nodos.*ativos/i,
      action: () => onAction('listar nodos'),
      description: 'Lista todos os nodos ativos',
      category: 'ledger'
    },
    {
      id: 'clear-ritual',
      pattern: /limpar.*console|resetar.*ritual/i,
      action: () => onAction('clear'),
      description: 'Limpa o console de ritual',
      category: 'utility'
    }
  ]);

  const processText = useCallback((text: string) => {
    for (const cmd of commands) {
      if (cmd.pattern.test(text)) {
        cmd.action([]);
        return true;
      }
    }
    return false;
  }, [commands]);

  return { processText, commands };
};
