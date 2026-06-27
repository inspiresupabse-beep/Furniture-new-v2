import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import BoardSection from './BoardSection';
import DimensionSection from './DimensionSection';
import HardwareSection from './HardwareSection';
import { useAuth } from '../context/AuthContext';
import { calculateEstimate, formatCurrency, formatCurrencyDetailed } from '../utils/calculations';
import { convertDimension, createInitialBoardState, fromInches } from '../utils/dimensionUtils';
import { getDefaultBedHardwareState, getDefaultWardrobeHardwareState } from '../utils/hardwareUtils';
import { generateQuotationPDF } from '../utils/pdfExport';

function EstimationDashboard({ materials, hardware }) {
  const { authFetch } = useAuth();
  const [clientView, setClientView] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    clientName: '',
    productType: 'wardrobe',
    useStandardSize: false,
    bedSize: 'king',
    dimensionUnit: 'inch',
    width: 72,
    height: 84,
    depth: 24,
    shelvesCount: 3,
    wastagePercent: 10,
    doors: 3,
    hasCushionHeadboard: false,
    boardState: createInitialBoardState(materials),
    hardwareState: getDefaultWardrobeHardwareState(hardware),
    transportCost: 0,
    installationCost: 0,
    applyGst: true,
    marginPercent: 0,
  });

  const update = (patch) => setFormState((prev) => ({ ...prev, ...patch }));

  const handleProductTypeChange = (type) => {
    const unit = formState.dimensionUnit;
    if (type === 'bed') {
      const king = materials.bedSizes.king;
      update({
        productType: type,
        useStandardSize: true,
        bedSize: 'king',
        width: fromInches(king.length, unit),
        height: fromInches(king.width, unit),
        depth: fromInches(18, unit),
        boardState: {
          ...createInitialBoardState(materials),
          box_17mm: { enabled: true, selectedBrand: 'Century' },
        },
        hardwareState: getDefaultBedHardwareState(hardware),
      });
    } else {
      update({
        productType: type,
        width: fromInches(72, unit),
        height: fromInches(84, unit),
        depth: fromInches(24, unit),
        shelvesCount: 3,
        doors: 3,
        boardState: createInitialBoardState(materials),
        hardwareState: getDefaultWardrobeHardwareState(hardware),
      });
    }
  };

  const handleStandardSizeToggle = (useStandard) => {
    if (useStandard && formState.productType === 'bed') {
      const size = materials.bedSizes[formState.bedSize];
      const unit = formState.dimensionUnit;
      update({
        useStandardSize: true,
        width: fromInches(size.length, unit),
        height: fromInches(size.width, unit),
      });
    } else {
      update({ useStandardSize: useStandard });
    }
  };

  const handleBedSizeChange = (sizeKey) => {
    const size = materials.bedSizes[sizeKey];
    const unit = formState.dimensionUnit;
    update({
      bedSize: sizeKey,
      width: fromInches(size.length, unit),
      height: fromInches(size.width, unit),
      useStandardSize: true,
    });
  };

  const handleUnitChange = (newUnit) => {
    const oldUnit = formState.dimensionUnit;
    if (oldUnit === newUnit) return;
    update({
      dimensionUnit: newUnit,
      width: convertDimension(formState.width, oldUnit, newUnit),
      height: convertDimension(formState.height, oldUnit, newUnit),
      depth: convertDimension(formState.depth, oldUnit, newUnit),
    });
  };

  const estimate = useMemo(
    () => calculateEstimate(formState, materials, hardware),
    [formState, materials, hardware]
  );

  const handleDownloadPDF = () => {
    generateQuotationPDF({ formState, estimate, materials, clientView });
  };

  const handleSaveEstimate = async () => {
    setSaving(true);
    setSaveStatus('');
    try {
      const res = await authFetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formState,
          estimateData: estimate,
          clientName: formState.clientName,
          productType: formState.productType,
          finalPrice: estimate.finalPrice,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save estimate');
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100 disabled:opacity-60';

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => setClientView(!clientView)}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
            clientView
              ? 'border-amber-400 bg-amber-50 text-amber-900'
              : 'border-stone-200 bg-white text-stone-700 hover:border-amber-300'
          }`}
        >
          {clientView ? 'Client View ON' : 'Client View OFF'}
        </button>
        <button
          type="button"
          onClick={handleSaveEstimate}
          disabled={saving}
          className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-800 hover:bg-violet-100 transition disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Estimate'}
        </button>
        <button
          type="button"
          onClick={handleDownloadPDF}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition"
        >
          Download Quotation
        </button>
        {saveStatus === 'saved' && (
          <span className="text-sm text-green-700">
            Saved!{' '}
            <Link to="/saved" className="font-medium underline">
              View saved estimates
            </Link>
          </span>
        )}
        {saveStatus && saveStatus !== 'saved' && (
          <span className="text-sm text-red-600">{saveStatus}</span>
        )}
      </div>

      <div className="rounded-xl border border-stone-200 bg-white shadow-sm mb-6">
          <div className="border-b border-stone-200 px-5 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500">Input Form</h2>
          </div>
          <div className="p-5 space-y-6">
            {/* Client & Product */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-dark border-b-2 border-amber-100 pb-1 mb-3">
                Client & Product
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                <div>
                  <label className="block text-xs font-medium mb-1">Client Name</label>
                  <input
                    type="text"
                    placeholder="Enter client name"
                    className={inputClass}
                    value={formState.clientName}
                    onChange={(e) => update({ clientName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Product Type</label>
                  <div className="flex rounded-lg border border-stone-200 bg-stone-50 p-0.5 gap-0.5">
                    {['wardrobe', 'bed'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleProductTypeChange(type)}
                        className={`flex-1 rounded-md py-2 text-xs font-medium capitalize transition ${
                          formState.productType === type
                            ? 'bg-white shadow text-navy'
                            : 'text-stone-500 hover:text-stone-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Material Module */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-dark border-b-2 border-amber-100 pb-1 mb-3">
                Material Module
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Enter dimensions, board materials, and hardware before reviewing the breakdown below.
              </p>
              <div className="space-y-4">
                <DimensionSection
                  embedded
                  formState={formState}
                  materials={materials}
                  onUpdate={update}
                  onUnitChange={handleUnitChange}
                  onStandardSizeToggle={handleStandardSizeToggle}
                  onBedSizeChange={handleBedSizeChange}
                />
                <BoardSection
                  materials={materials}
                  productType={formState.productType}
                  value={formState.boardState}
                  onChange={(boardState) => update({ boardState })}
                />
                <HardwareSection
                  hardware={hardware}
                  value={formState.hardwareState}
                  onChange={(hardwareState) => update({ hardwareState })}
                />
              </div>
            </section>

            {/* Extras & Pricing */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-dark border-b-2 border-amber-100 pb-1 mb-3">
                Extras & Pricing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl">
                <div>
                  <label className="block text-xs font-medium mb-1">Transport (₹)</label>
                  <input type="number" min="0" className={inputClass} value={formState.transportCost}
                    onChange={(e) => update({ transportCost: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Installation (₹)</label>
                  <input type="number" min="0" className={inputClass} value={formState.installationCost}
                    onChange={(e) => update({ installationCost: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Margin / Discount (%)</label>
                  <input type="number" step="0.5" placeholder="Positive = margin, Negative = discount"
                    className={inputClass} value={formState.marginPercent}
                    onChange={(e) => update({ marginPercent: e.target.value })} />
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer sm:mt-5">
                  <input type="checkbox" className="toggle-input" checked={formState.applyGst}
                    onChange={(e) => update({ applyGst: e.target.checked })} />
                  <span className="toggle-track" />
                  <span className="text-xs font-medium">Apply GST (18%)</span>
                </label>
              </div>
            </section>
          </div>
        </div>

        {/* Results */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">
            Estimation Results
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Material */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
            <div className="px-5 py-4">
              <h2 className="text-base font-bold text-slate-800">Material breakdown</h2>
            </div>
            <div className="px-5 pb-5 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wide text-[10px]">
                    <th className="text-left py-2 pr-2">Component</th>
                    <th className="text-right py-2 pr-2">Area</th>
                    <th className="text-right py-2 pr-2">Rate</th>
                    <th className="text-right py-2 pr-2">Wastage %</th>
                    <th className="text-right py-2">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.materialItems.map((item, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-2 pr-2 text-slate-700">
                        <div className="font-medium">{item.name}</div>
                        {item.dimensionNote && (
                          <div className="text-[10px] text-slate-500 font-normal mt-0.5 leading-snug">
                            {item.dimensionNote}
                          </div>
                        )}
                      </td>
                      <td className="py-2 pr-2 text-right tabular-nums text-slate-600">
                        {item.isFixed ? '—' : `${item.area.toFixed(2)} sq ft`}
                      </td>
                      <td className="py-2 pr-2 text-right tabular-nums text-slate-600">
                        {item.isFixed ? '—' : formatCurrencyDetailed(item.rate)}
                      </td>
                      <td className="py-2 pr-2 text-right tabular-nums text-slate-600">
                        {item.isWastage
                          ? `${estimate.wastagePercent}%`
                          : estimate.wastagePercent > 0
                          ? `${estimate.wastagePercent}%`
                          : '—'}
                      </td>
                      <td className="py-2 text-right tabular-nums font-semibold text-slate-800">
                        {formatCurrencyDetailed(item.cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold text-slate-800">
                    <td className="pt-3 pr-2">
                      Total material ({estimate.materialTotalArea.toFixed(2)} sq ft)
                    </td>
                    <td colSpan="3" className="pt-3" />
                    <td className="pt-3 text-right tabular-nums">
                      {formatCurrencyDetailed(estimate.materialCost)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Labor */}
          <div className={`rounded-xl border border-stone-200 bg-white shadow-sm ${clientView ? 'client-hidden' : ''}`}>
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500">Labor Breakdown</h2>
              <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">45% of Material</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { name: 'Cutting', pct: '15%', value: estimate.labor.cutting },
                  { name: 'Edge Banding', pct: '15%', value: estimate.labor.edgeBanding },
                  { name: 'Assembling', pct: '15%', value: estimate.labor.assembling },
                ].map((item) => (
                  <div key={item.name} className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-center">
                    <div className="text-[10px] uppercase tracking-wide text-stone-500">{item.name}</div>
                    <div className="text-[10px] font-semibold text-amber-800 my-1">{item.pct}</div>
                    <div className="text-sm font-semibold tabular-nums">{formatCurrency(item.value)}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-3 text-sm font-semibold">
                <span>Labor Total</span>
                <span className="tabular-nums">{formatCurrency(estimate.labor.total)}</span>
              </div>
            </div>
          </div>

          {/* Hardware */}
          {estimate.hardwareItems.length > 0 && (
            <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500">Hardware</h2>
                <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  {formatCurrency(estimate.hardwareCost)}
                </span>
              </div>
              <div className="p-5 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wide">
                      <th className="text-left py-2">Item</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Unit</th>
                      <th className="text-right py-2">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimate.hardwareItems.map((item, i) => (
                      <tr key={i} className="border-b border-stone-100">
                        <td className="py-2">{item.name}</td>
                        <td className="py-2 text-right tabular-nums">{item.qty}</td>
                        <td className="py-2 text-right tabular-nums">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-2 text-right tabular-nums font-medium">{formatCurrency(item.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold">
                      <td colSpan="3" className="pt-3">Hardware Total</td>
                      <td className="pt-3 text-right tabular-nums">{formatCurrency(estimate.hardwareCost)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="rounded-xl border border-stone-200 bg-white shadow-sm lg:col-span-2">
            <div className="border-b border-stone-200 px-5 py-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500">Final Summary</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Material Cost', value: estimate.materialCost, hide: false },
                  { label: 'Labor Cost', value: estimate.labor.total, hide: clientView },
                  { label: 'Hardware', value: estimate.hardwareCost, hide: false },
                  { label: 'Transport', value: estimate.transportCost, hide: estimate.transportCost <= 0 },
                  { label: 'Installation', value: estimate.installationCost, hide: estimate.installationCost <= 0 },
                  { label: 'Subtotal', value: estimate.subtotal, hide: false },
                  { label: 'GST (18%)', value: estimate.gstAmount, hide: !formState.applyGst },
                  {
                    label: `${Number(formState.marginPercent) > 0 ? 'Margin' : 'Discount'} (${formState.marginPercent}%)`,
                    value: estimate.marginAmount,
                    hide: Number(formState.marginPercent) === 0,
                  },
                ]
                  .filter((line) => !line.hide)
                  .map((line) => (
                    <div key={line.label} className="flex justify-between">
                      <span className="text-stone-500">{line.label}</span>
                      <span className="tabular-nums font-medium">{formatCurrency(line.value)}</span>
                    </div>
                  ))}
              </div>
              <div className="rounded-xl bg-navy px-8 py-6 text-center min-w-[220px]">
                <div className="text-[10px] uppercase tracking-widest text-white/60 mb-1">Final Net Price</div>
                <div className="text-3xl font-bold tabular-nums text-brand">{formatCurrency(estimate.finalPrice)}</div>
              </div>
            </div>
          </div>
        </div>
        </div>
    </>
  );
}

export default EstimationDashboard;
