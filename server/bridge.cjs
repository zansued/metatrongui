const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;
const ROOT_DIR = path.resolve(__dirname, '..');

app.use(cors());
app.use(express.json());

// Log middleware
app.use((req, res, next) => {
  console.log(`[Bridge] ${req.method} ${req.url}`);
  next();
});

/**
 * Endpoint for Metatron Actions (Writing files, etc.)
 */
/**
 * Endpoint para listar skills do Vault
 */
app.get('/api/vault-skills', (req, res) => {
  const VAULT_SKILLS_DIR = path.resolve('D:/GEMINI CLI/antigravity-agent-vault/skills');
  
  try {
    if (!fs.existsSync(VAULT_SKILLS_DIR)) {
      return res.json({ skills: [], error: 'Diretório do Vault não encontrado' });
    }

    const files = fs.readdirSync(VAULT_SKILLS_DIR, { withFileTypes: true });
    const skills = files
      .filter(f => f.isFile() && f.name.endsWith('.md'))
      .map(f => ({
        name: f.name.replace('.md', ''),
        path: path.join(VAULT_SKILLS_DIR, f.name)
      }));

    res.json({ count: skills.length, skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/vault-skills', (req, res) => {
  const VAULT_SKILLS_DIR = 'D:/GEMINI CLI/antigravity-agent-vault/skills';
  const fs = require('fs');
  const path = require('path');
  
  try {
    if (!fs.existsSync(VAULT_SKILLS_DIR)) {
      return res.json({ skills: [], error: 'Diretório do Vault não encontrado' });
    }

    const files = fs.readdirSync(VAULT_SKILLS_DIR, { withFileTypes: true });
    const skills = files
      .filter(f => f.isFile() && f.name.endsWith('.md'))
      .map(f => ({
        name: f.name.replace('.md', ''),
        path: path.join(VAULT_SKILLS_DIR, f.name)
      }));

    res.json({ count: skills.length, skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/metatron-action', (req, res) => {
  const action = req.body;
  const { type, path: filePath, content } = action;

  if (!type || !filePath) {
    return res.status(400).json({ error: 'Faltam parâmetros (type ou path)' });
  }

  const absolutePath = path.isAbsolute(filePath) 
    ? filePath 
    : path.resolve(ROOT_DIR, filePath);

  console.log(`[Bridge] Requisitando ${type} em ${absolutePath}`);

  try {
    if (type === 'file' || type === 'write') {
      // Create directories if they don't exist
      fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
      fs.writeFileSync(absolutePath, content || '');
      return res.json({ success: true, message: `Arquivo ${path.basename(absolutePath)} tecido com sucesso.` });
    }

    if (type === 'shell' || type === 'run') {
       // SHELL actions would need safety checks - for now we log it
       console.warn(`[Bridge] Comando shell solicitado: ${action.command || 'sem comando'}`);
       return res.json({ success: true, message: 'Comando recebido pelo núcleo para processamento futuro.' });
    }

    res.status(400).json({ error: 'Tipo de ação desconhecido' });
  } catch (err) {
    console.error(`[Bridge] Erro na execução:`, err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🌌 METATRON SOVEREIGN BRIDGE`);
  console.log(`📡 Ouvindo em http://localhost:${PORT}`);
  console.log(`📂 Diretório Raiz: ${ROOT_DIR}\n`);
});
