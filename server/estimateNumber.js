export function getEstimateNumberPrefix(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now);

  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;

  return `EST-${year}-${month}-`;
}

export function formatEstimateSequence(sequence) {
  return String(sequence).padStart(2, '0');
}

export async function generateNextEstimateNumber(supabase) {
  const prefix = getEstimateNumberPrefix();

  const { data, error } = await supabase
    .from('estimates')
    .select('estimate_number')
    .like('estimate_number', `${prefix}%`)
    .order('estimate_number', { ascending: false })
    .limit(1);

  if (error) throw error;

  let nextSequence = 1;
  if (data?.[0]?.estimate_number) {
    const suffix = data[0].estimate_number.slice(prefix.length);
    const parsed = parseInt(suffix, 10);
    if (!Number.isNaN(parsed)) {
      nextSequence = parsed + 1;
    }
  }

  return `${prefix}${formatEstimateSequence(nextSequence)}`;
}

export async function insertEstimateWithNumber(supabase, row) {
  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const estimateNumber = await generateNextEstimateNumber(supabase);
    const { data, error } = await supabase
      .from('estimates')
      .insert({ ...row, estimate_number: estimateNumber })
      .select('id, client_name, product_type, final_price, estimate_number, created_at')
      .single();

    if (!error) return { data, error: null };
    if (error.code === '23505') continue;
    return { data: null, error };
  }

  return {
    data: null,
    error: new Error('Could not assign a unique estimate number. Please try again.'),
  };
}
