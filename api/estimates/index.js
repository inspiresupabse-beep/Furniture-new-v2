import {
  handleListEstimates,
  handleCreateEstimate,
} from '../../server/handlers/estimates.js';

export default function handler(req, res) {
  if (req.method === 'GET') return handleListEstimates(req, res);
  if (req.method === 'POST') return handleCreateEstimate(req, res);
  return res.status(405).json({ error: 'Method not allowed' });
}
