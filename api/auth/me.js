import { handleMe } from '../../server/handlers/auth.js';

export default function handler(req, res) {
  return handleMe(req, res);
}
