import { getSupabaseAdmin } from '../supabaseAdmin.js';
import { requireAuth } from '../authUtils.js';

export async function handleListEstimates(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('estimates')
      .select('id, client_name, product_type, final_price, created_at')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    console.error('List estimates error:', err);
    return res.status(500).json({ error: err.message || 'Failed to load estimates' });
  }
}

export async function handleCreateEstimate(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const { formState, estimateData, clientName, productType, finalPrice } = req.body || {};

    if (!formState || !estimateData) {
      return res.status(400).json({ error: 'Missing estimate data' });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('estimates')
      .insert({
        user_id: auth.userId,
        client_name: clientName || formState.clientName || null,
        product_type: productType || formState.productType,
        form_state: formState,
        estimate_data: estimateData,
        final_price: Number(finalPrice ?? estimateData.finalPrice ?? 0),
      })
      .select('id, client_name, product_type, final_price, created_at')
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (err) {
    console.error('Create estimate error:', err);
    return res.status(500).json({ error: err.message || 'Failed to save estimate' });
  }
}

export async function handleGetEstimate(req, res, id) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('id', id)
      .eq('user_id', auth.userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Get estimate error:', err);
    return res.status(500).json({ error: err.message || 'Failed to load estimate' });
  }
}

export async function handleUpdateEstimate(req, res, id) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const { formState, estimateData, clientName, productType, finalPrice } = req.body || {};

    if (!formState || !estimateData) {
      return res.status(400).json({ error: 'Missing estimate data' });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('estimates')
      .update({
        client_name: clientName || formState.clientName || null,
        product_type: productType || formState.productType,
        form_state: formState,
        estimate_data: estimateData,
        final_price: Number(finalPrice ?? estimateData.finalPrice ?? 0),
      })
      .eq('id', id)
      .eq('user_id', auth.userId)
      .select('id, client_name, product_type, final_price, created_at')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Update estimate error:', err);
    return res.status(500).json({ error: err.message || 'Failed to update estimate' });
  }
}

export async function handleDeleteEstimate(req, res, id) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const supabase = getSupabaseAdmin();
    const { error, count } = await supabase
      .from('estimates')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) throw error;
    if (count === 0) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Delete estimate error:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete estimate' });
  }
}
