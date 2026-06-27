import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/calculations';

function SavedEstimates() {
  const { authFetch } = useAuth();
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEstimates = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch('/api/estimates');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load estimates');
      setEstimates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstimates();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this saved estimate?')) return;
    try {
      const res = await authFetch(`/api/estimates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setEstimates((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="text-stone-500 py-12 text-center">Loading saved estimates...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-red-600">{error}</p>
        <button type="button" onClick={loadEstimates} className="rounded-lg bg-brand px-4 py-2 text-sm text-white">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Saved Estimates</h2>
          <p className="text-sm text-stone-500 mt-1">Your previously saved quotations</p>
        </div>
        <Link
          to="/"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition"
        >
          New Estimate
        </Link>
      </div>

      {estimates.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-12 text-center text-stone-500">
          No saved estimates yet. Create one and click <strong>Save Estimate</strong>.
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Final Price</th>
                <th className="px-5 py-3">Saved</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {estimates.map((item) => (
                <tr key={item.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-5 py-3 font-medium">{item.client_name || '—'}</td>
                  <td className="px-5 py-3 capitalize">{item.product_type}</td>
                  <td className="px-5 py-3 tabular-nums font-semibold">{formatCurrency(item.final_price)}</td>
                  <td className="px-5 py-3 text-stone-500">
                    {new Date(item.created_at).toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SavedEstimates;
