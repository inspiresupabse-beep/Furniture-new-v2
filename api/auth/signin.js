import { handleSignin } from '../../server/handlers/auth.js';

export default function handler(req, res) {
  return handleSignin(req, res);
}
