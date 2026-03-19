import { supabase } from '../lib/supabasePortal'

export interface KnowledgeNode {
  id?: string;
  name: string;
  type: string;
  metadata?: {
    description?: string;
    horizons?: number[];
    tech?: string[];
    goal?: string;
    [key: string]: any;
  };
  created_at?: string;
}

export const KnowledgeService = {
  async fetchNodes() {
    try {
      const { data, error } = await supabase
        .from('geminicli_knowledge_nodes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as KnowledgeNode[];
    } catch (error) {
      console.error('[KnowledgeService] Error fetching nodes:', error);
      return [];
    }
  },

  async saveNode(node: KnowledgeNode) {
    try {
      const { data, error } = await supabase
        .from('geminicli_knowledge_nodes')
        .insert([node])
        .select()
        .single();

      if (error) throw error;
      console.log('[KnowledgeService] Node saved:', data);
      return data as KnowledgeNode;
    } catch (error) {
      console.error('[KnowledgeService] Error saving node:', error);
      return null;
    }
  },

  async deleteNode(id: string) {
    try {
      const { error } = await supabase
        .from('geminicli_knowledge_nodes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[KnowledgeService] Error deleting node:', error);
      return false;
    }
  }
}
