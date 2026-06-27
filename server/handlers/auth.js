import { getSupabaseAdmin } from '../supabaseAdmin.js';
import { hashPassword, verifyPassword, signToken } from '../authUtils.js';

export async function handleSignup(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body || {};
    const normalizedUsername = String(username || '').trim().toLowerCase();

    if (normalizedUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const supabase = getSupabaseAdmin();
    const passwordHash = await hashPassword(password);

    const { data, error } = await supabase
      .from('app_users')
      .insert({ username: normalizedUsername, password_hash: passwordHash })
      .select('id, username, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Username already exists' });
      }
      throw error;
    }

    const token = signToken(data);
    return res.status(201).json({ token, user: { id: data.id, username: data.username } });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: err.message || 'Signup failed' });
  }
}

export async function handleSignin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body || {};
    const normalizedUsername = String(username || '').trim().toLowerCase();

    if (!normalizedUsername || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const supabase = getSupabaseAdmin();
    const { data: user, error } = await supabase
      .from('app_users')
      .select('id, username, password_hash')
      .eq('username', normalizedUsername)
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = signToken(user);
    return res.status(200).json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error('Signin error:', err);
    return res.status(500).json({ error: err.message || 'Sign in failed' });
  }
}
