import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleSignup, handleSignin } from './handlers/auth.js';
import {
  handleListEstimates,
  handleCreateEstimate,
  handleGetEstimate,
  handleDeleteEstimate,
} from './handlers/estimates.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MATERIALS_PATH = path.join(__dirname, 'data', 'materials.json');
const HARDWARE_PATH = path.join(__dirname, 'data', 'hardware.json');

const app = express();

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

app.post('/api/auth/signup', (req, res) => handleSignup(req, res));
app.post('/api/auth/signin', (req, res) => handleSignin(req, res));
app.get('/api/estimates', (req, res) => handleListEstimates(req, res));
app.post('/api/estimates', (req, res) => handleCreateEstimate(req, res));
app.get('/api/estimates/:id', (req, res) => handleGetEstimate(req, res, req.params.id));
app.delete('/api/estimates/:id', (req, res) => handleDeleteEstimate(req, res, req.params.id));

export default app;
