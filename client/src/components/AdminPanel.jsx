import { useState, useEffect } from 'react';

function AdminPanel({ materials, hardware, onSave }) {
  const [matData, setMatData] = useState(null);
  const [hwData, setHwData] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMatData(JSON.parse(JSON.stringify(materials)));
    setHwData(JSON.parse(JSON.stringify(hardware)));
  }, [materials, hardware]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const updateBoardRate = (index, field, value) => {
    const rates = [...matData.rates];
    rates[index] = { ...rates[index], [field]: field === 'pricePerSqft' ? Number(value) : value };
    setMatData({ ...matData, rates });
  };

  const addBoardRate = () => {
    const category = 'box_17mm';
    const brand = matData.catalog.boards[category][0];
    setMatData({
      ...matData,
      rates: [...matData.rates, { id: String(Date.now()), category, brand, pricePerSqft: 0 }],
    });
  };

  const removeBoardRate = (index) => {
    setMatData({ ...matData, rates: matData.rates.filter((_, i) => i !== index) });
  };

  const updateHwRate = (index, field, value) => {
    const rates = [...hwData.rates];
    rates[index] = {
      ...rates[index],
      [field]: ['unitPrice', 'defaultQty'].includes(field) ? Number(value) : value,
    };
    setHwData({ ...hwData, rates });
  };

  const updateCompany = (field, value) => {
    setMatData({ ...matData, company: { ...matData.company, [field]: value } });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        fetch('/api/materials', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(matData) }),
        fetch('/api/hardware', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(hwData) }),
      ]);
      showToast('Configuration saved successfully!');
      onSave();
    } catch {
      showToast('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!matData || !hwData) return <div className="flex justify-center py-20 text-stone-500">Loading...</div>;

  const inputClass =
    'w-full rounded-lg border border-stone-200 bg-stone-50 px-2 py-1.5 text-xs focus:border-amber-500 focus:outline-none';

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Board Rates */}
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500">Board Material Rates</h2>
            <button type="button" onClick={addBoardRate}
              className="rounded-lg border border-stone-200 px-3 py-1 text-xs font-medium hover:border-amber-300">
              + Add Rate
            </button>
          </div>
          <div className="p-5 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase">
                  <th className="text-left py-2 pr-2">Category</th>
                  <th className="text-left py-2 pr-2">Brand</th>
                  <th className="text-left py-2 pr-2">₹/sq.ft</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {matData.rates.map((rate, i) => (
                  <tr key={rate.id} className="border-b border-stone-100">
                    <td className="py-2 pr-2">
                      <select className={inputClass} value={rate.category}
                        onChange={(e) => updateBoardRate(i, 'category', e.target.value)}>
                        {Object.entries(matData.catalog.boardLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <select className={inputClass} value={rate.brand}
                        onChange={(e) => updateBoardRate(i, 'brand', e.target.value)}>
                        {(matData.catalog.boards[rate.category] || []).map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <input type="number" min="0" className={inputClass} value={rate.pricePerSqft}
                        onChange={(e) => updateBoardRate(i, 'pricePerSqft', e.target.value)} />
                    </td>
                    <td className="py-2">
                      <button type="button" onClick={() => removeBoardRate(i)}
                        className="rounded border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hardware Rates */}
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-5 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500">Hardware Rates</h2>
          </div>
          <div className="p-5 overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase">
                  <th className="text-left py-2 pr-2">Item</th>
                  <th className="text-left py-2 pr-2">Unit ₹</th>
                  <th className="text-left py-2">Default Qty</th>
                </tr>
              </thead>
              <tbody>
                {hwData.rates.map((rate, i) => {
                  const label =
                    rate.category === 'locks' ? `${rate.brand} (${rate.clamp})` :
                    rate.category === 'sliders' ? `${rate.brand} ${rate.size}` :
                    rate.category === 'handles' ? rate.handleType :
                    rate.variant;
                  return (
                    <tr key={rate.id} className="border-b border-stone-100">
                      <td className="py-2 pr-2">
                        <span className="text-stone-400">{hwData.hardwareLabels[rate.category]} — </span>
                        {label}
                      </td>
                      <td className="py-2 pr-2">
                        <input type="number" min="0" className={inputClass} value={rate.unitPrice}
                          onChange={(e) => updateHwRate(i, 'unitPrice', e.target.value)} />
                      </td>
                      <td className="py-2">
                        <input type="number" min="0" className={inputClass} value={rate.defaultQty}
                          onChange={(e) => updateHwRate(i, 'defaultQty', e.target.value)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Company Details */}
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-5 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500">Company Details (PDF)</h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { key: 'name', label: 'Company Name' },
              { key: 'address', label: 'Address' },
              { key: 'phone', label: 'Phone' },
              { key: 'email', label: 'Email' },
              { key: 'gstin', label: 'GSTIN' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-1">{label}</label>
                <input className={inputClass} value={matData.company[key]}
                  onChange={(e) => updateCompany(key, e.target.value)} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium mb-1">Cushion Headboard Cost (₹)</label>
              <input type="number" min="0" className={inputClass} value={matData.cushionHeadboardCost}
                onChange={(e) => setMatData({ ...matData, cushionHeadboardCost: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        {/* Catalog Reference */}
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-5 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500">Product Catalog Reference</h2>
          </div>
          <div className="p-5 space-y-4 text-xs">
            {Object.entries(matData.catalog.boardLabels).map(([key, label]) => (
              <div key={key}>
                <div className="font-semibold text-brand-dark mb-1">{label}</div>
                <div className="text-stone-500">{matData.catalog.boards[key].join(', ')}</div>
              </div>
            ))}
            <hr className="border-stone-200" />
            {Object.entries(hwData.hardwareLabels).map(([key, label]) => (
              <div key={key}>
                <div className="font-semibold text-brand-dark mb-1">{label}</div>
                <div className="text-stone-500">
                  {Array.isArray(hwData.catalog[key])
                    ? hwData.catalog[key].join(', ')
                    : key === 'handles'
                    ? hwData.catalog.handles.types.join(', ')
                    : key === 'locks'
                    ? `${hwData.catalog.locks.brands.join(', ')} | Clamps: ${hwData.catalog.locks.clamps.join(', ')}`
                    : `${hwData.catalog.sliders.brands.join(', ')} | Sizes: ${hwData.catalog.sliders.sizes.join(', ')}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 mt-6 -mx-8 px-8 py-4 bg-white border-t border-stone-200 flex justify-end shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <button type="button" onClick={handleSave} disabled={saving}
          className="rounded-lg bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

export default AdminPanel;
