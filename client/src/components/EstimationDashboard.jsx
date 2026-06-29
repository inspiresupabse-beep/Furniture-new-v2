import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import BoardSection from './BoardSection';
import DimensionSection from './DimensionSection';
import HardwareSection from './HardwareSection';
import EstimatePreviewSidebar from './EstimatePreviewSidebar';
import { useAuth } from '../context/AuthContext';
import { calculateEstimate, formatCurrencyDetailed } from '../utils/calculations';
import { convertDimension, fromInches } from '../utils/dimensionUtils';
import { getDefaultBedHardwareState, getDefaultWardrobeHardwareState } from '../utils/hardwareUtils';
import { createDefaultFormState, mergeSavedFormState } from '../utils/formState';
import { generateQuotationPDF } from '../utils/pdfExport';

function MaterialBreakdownCard({ estimate }) {
  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50/60 shadow-sm print-area">
      <div className="px-5 py-4 border-b border-sky-100">
        <h2 className="text-base font-bold text-slate-800">Material breakdown</h2>
      </div>
      <div className="px-5 py-4 space-y-3">
        {estimate.materialItems.map((item, i) => (
          <div key={i} className="flex items-start justify-between gap-3 text-sm border-b border-sky-100/80 pb-3 last:border-0 last:pb-0">
            <div className="min-w-0">
              <div className="font-semibold text-slate-800">{item.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {item.isFixed
                  ? item.spec
                  : `${item.area.toFixed(2)} sq ft × ${formatCurrencyDetailed(item.rate)}`}
              </div>
            </div>
            <div className="font-bold text-slate-800 tabular-nums shrink-0">
              {formatCurrencyDetailed(item.cost)}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2 border-t border-sky-200 font-bold text-slate-900">
          <span>Total material ({estimate.materialTotalArea.toFixed(2)} sq ft)</span>
          <span className="tabular-nums">{formatCurrencyDetailed(estimate.materialCost)}</span>
        </div>
      </div>
    </div>
  );
}

function EstimationDashboard({ materials, hardware }) {
  const { authFetch } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [clientView, setClientView] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [estimateNumber, setEstimateNumber] = useState('');
  const [lastSavedNumber, setLastSavedNumber] = useState('');
  const [formState, setFormState] = useState(() => createDefaultFormState(materials, hardware));

  const update = (patch) => setFormState((prev) => ({ ...prev, ...patch }));

  const startNewEstimate = () => {
    setFormState(createDefaultFormState(materials, hardware));
    setEditingId(null);
    setEstimateNumber('');
    setSaveStatus('');
    setClientView(false);
  };

  useEffect(() => {
    if (location.state?.fresh) {
      startNewEstimate();
      setLastSavedNumber('');
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    const editEstimate = location.state?.editEstimate;
    if (editEstimate?.form_state) {
      setFormState(mergeSavedFormState(editEstimate.form_state, materials, hardware));
      setEditingId(editEstimate.id);
      setEstimateNumber(editEstimate.estimate_number || '');
      setLastSavedNumber('');
      setSaveStatus('');
      setClientView(false);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate, materials, hardware]);

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
        boardState: createDefaultFormState(materials, hardware, 'bed').boardState,
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
        boardState: createDefaultFormState(materials, hardware, 'wardrobe').boardState,
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
    generateQuotationPDF({ formState, estimate, materials, clientView, estimateNumber });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (!confirm('Reset the form to defaults?')) return;
    startNewEstimate();
    setLastSavedNumber('');
  };

  const handleSaveEstimate = async () => {
    setSaving(true);
    setSaveStatus('');
    try {
      const payload = {
        formState,
        estimateData: estimate,
        clientName: formState.clientName,
        productType: formState.productType,
        finalPrice: estimate.finalPrice,
      };
      const isUpdate = Boolean(editingId);
      const url = isUpdate ? `/api/estimates/${editingId}` : '/api/estimates';
      const res = await authFetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save estimate');

      if (isUpdate) {
        if (data.estimate_number) setEstimateNumber(data.estimate_number);
        setSaveStatus('updated');
      } else {
        setLastSavedNumber(data.estimate_number || '');
        startNewEstimate();
        setSaveStatus('saved');
      }
    } catch (err) {
      setSaveStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full min-h-[44px] rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-base leading-normal focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100 disabled:opacity-60';

  return (
    <div className="dashboard-split">
      {/* Left pane — data entry */}
      <section className="dashboard-split__forms order-2 lg:order-1">
        <div className="space-y-5 p-0 lg:p-5">
          {editingId && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800 flex items-center justify-between no-print">
              <span>
                Editing saved invoice{estimateNumber ? ` · ${estimateNumber}` : ''}
              </span>
              <button type="button" onClick={handleReset} className="text-blue-600 font-medium hover:underline">
                Cancel edit
              </button>
            </div>
          )}

          <div className="rounded-xl border border-stone-200 bg-white shadow-sm lg:border-0 lg:shadow-none lg:rounded-none no-print">
            <div className="border-b border-stone-200 px-5 py-3 lg:px-0 lg:pt-0">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                Data Entry
              </h2>
            </div>
            <div className="p-5 space-y-6 lg:px-0 lg:pb-0">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-dark border-b-2 border-amber-100 pb-1 mb-3">
                  Client & Product
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-dark border-b-2 border-amber-100 pb-1 mb-3">
                  Material Module
                </h3>
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

              <MaterialBreakdownCard estimate={estimate} />

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-dark border-b-2 border-amber-100 pb-1 mb-3">
                  Extras & Pricing
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
        </div>
      </section>

      {/* Right pane — sticky live preview */}
      <aside className="dashboard-split__preview order-1 lg:order-2 no-print">
        <div className="dashboard-split__preview-sticky">
          <EstimatePreviewSidebar
            materials={materials}
            formState={formState}
            estimate={estimate}
            estimateNumber={estimateNumber}
            applyGst={formState.applyGst}
            clientView={clientView}
            onToggleClientView={() => setClientView(!clientView)}
            onSave={handleSaveEstimate}
            onDownloadPdf={handleDownloadPDF}
            onPrint={handlePrint}
            onReset={handleReset}
            saving={saving}
            saveStatus={saveStatus}
            editingId={editingId}
          />
          {saveStatus === 'saved' && lastSavedNumber && (
            <p className="text-center text-sm text-stone-600 mt-3 no-print">
              Saved as <span className="font-mono font-semibold text-indigo-700">{lastSavedNumber}</span>.
              {' '}Form cleared for the next estimate.
              {' '}
              <Link to="/reports" className="text-indigo-600 hover:underline font-medium">
                View report →
              </Link>
            </p>
          )}
          {saveStatus === 'updated' && (
            <p className="text-center text-sm text-green-700 mt-3 no-print">
              Estimate updated successfully.
              {' '}
              <Link to="/reports" className="text-indigo-600 hover:underline font-medium">
                View report →
              </Link>
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

export default EstimationDashboard;
