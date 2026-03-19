import { supabase } from '../lib/supabasePortal'

export interface KnowledgeNode {
  id?: string
  name: string
  type: 'DATABASE' | 'SERVER' | 'INTERFACE' | 'ORCHESTRATOR'
  metadata: {
    description: string
    goal: string
    tags?: string[]
  }
  created_at?: string
}

export const KnowledgeService = {
  async fetchNodes(): Promise<KnowledgeNode[]> {
    try {
      const { data, error } = await supabase
        .from('geminicli_knowledge_nodes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('[KnowledgeService] Error fetching nodes:', error)
        return []
      }
      return data || []
    } catch (e) {
      console.error('[KnowledgeService] Unexpected error:', e)
      return []
    }
  },

  async saveNode(node: KnowledgeNode): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('geminicli_knowledge_nodes')
        .insert([node])
      
      if (error) {
        console.error('[KnowledgeService] Error saving node:', error)
        return false
      }
      return true
    } catch (e) {
      console.error('[KnowledgeService] Unexpected error during save:', e)
      return false
    }
  },

  async deleteNode(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('geminicli_knowledge_nodes')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('[KnowledgeService] Error deleting node:', error)
        return false
      }
      return true
    } catch (e) {
      console.error('[KnowledgeService] Unexpected error during delete:', e)
      return false
    }
  }
}
