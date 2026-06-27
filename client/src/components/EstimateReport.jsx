import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/calculations';
import { generateQuotationPDF } from '../utils/pdfExport';

function EstimateReport({ materials }) {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return estimates;
    return estimates.filter((item) =>
      (item.client_name || '').toLowerCase().includes(term)
    );
  }, [estimates, search]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this invoice?')) return;
    try {
      const res = await authFetch(`/api/estimates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setEstimates((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = async (id) => {
    try {
      const res = await authFetch(`/api/estimates/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load invoice');
      navigate('/', { state: { editEstimate: data } });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownloadPdf = async (id) => {
    try {
      const res = await authFetch(`/api/estimates/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load invoice');
      generateQuotationPDF({
        formState: data.form_state,
        estimate: data.estimate_data,
        materials,
        clientView: false,
        estimateNumber: data.estimate_number,
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const displayEstimateNumber = (item) =>
    item.estimate_number || item.id.slice(0, 8).toUpperCase();

  if (loading) {
    return <div className="text-stone-500 py-12 text-center">Loading estimate report...</div>;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Estimate Report</h2>
          <p className="text-sm text-stone-500 mt-1">Search, edit, and manage saved invoices</p>
        </div>
        <Link
          to="/"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition text-center"
        >
          + New Estimate
        </Link>
      </div>

      <div className="mb-4 relative max-w-md">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">⌕</span>
        <input
          type="text"
          placeholder="Search by customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-12 text-center text-stone-500">
          {search ? 'No invoices match that customer name.' : 'No saved invoices yet.'}
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                <th className="px-5 py-3">Estimate #</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Grand Total</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-indigo-700">
                    {displayEstimateNumber(item)}
                  </td>
                  <td className="px-5 py-3 font-medium">{item.client_name || '—'}</td>
                  <td className="px-5 py-3 capitalize">{item.product_type}</td>
                  <td className="px-5 py-3 tabular-nums font-semibold">{formatCurrency(item.final_price)}</td>
                  <td className="px-5 py-3 text-stone-500">
                    {new Date(item.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(item.id)}
                        className="rounded-md border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(item.id)}
                        className="rounded-md border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
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

export default EstimateReport;
