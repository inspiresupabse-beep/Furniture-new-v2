import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

const MATERIALS_PATH = path.join(__dirname, 'data', 'materials.json');
const HARDWARE_PATH = path.join(__dirname, 'data', 'hardware.json');

app.use(cors());
app.use(express.json());

async function readJson(filePath) {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

app.get('/api/materials', async (_req, res) => {
  try {
    const data = await readJson(MATERIALS_PATH);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/materials', async (req, res) => {
  try {
    await writeJson(MATERIALS_PATH, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/hardware', async (_req, res) => {
  try {
    const data = await readJson(HARDWARE_PATH);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/hardware', async (req, res) => {
  try {
    await writeJson(HARDWARE_PATH, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) res.status(404).json({ message: 'Build client first with npm run build' });
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use. Stop the other process first:`);
    console.error('  npm run kill-dev-ports\n');
    process.exit(1);
  }
  throw err;
});
