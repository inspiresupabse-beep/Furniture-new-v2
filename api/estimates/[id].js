import {
  handleGetEstimate,
  handleUpdateEstimate,
  handleDeleteEstimate,
} from '../../server/handlers/estimates.js';

export default function handler(req, res) {
  const { id } = req.query;
  if (req.method === 'GET') return handleGetEstimate(req, res, id);
  if (req.method === 'PUT') return handleUpdateEstimate(req, res, id);
  if (req.method === 'DELETE') return handleDeleteEstimate(req, res, id);
  return res.status(405).json({ error: 'Method not allowed' });
}
