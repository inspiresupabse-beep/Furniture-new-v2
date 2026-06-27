import hardware from '../server/data/hardware.json' with { type: 'json' };

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json(hardware);
  }

  if (req.method === 'PUT') {
    return res.status(501).json({
      error: 'Saving changes is not supported on the hosted deployment yet.',
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
