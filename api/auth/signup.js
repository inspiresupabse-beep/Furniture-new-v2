import { handleSignup } from '../../server/handlers/auth.js';

export default function handler(req, res) {
  return handleSignup(req, res);
}
