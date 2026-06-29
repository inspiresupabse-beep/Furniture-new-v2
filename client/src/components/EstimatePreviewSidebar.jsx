import { formatCurrency, formatCurrencyDetailed } from '../utils/calculations';

function Row({ label, amount, bold, muted, sub }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-1 ${sub ? 'pl-4' : ''}`}>
      <span
        className={`text-sm leading-snug ${
          bold ? 'font-semibold text-slate-800' : muted ? 'text-slate-400 text-xs' : 'text-slate-600'
        }`}
      >
        {label}
      </span>
      <span
        className={`tabular-nums shrink-0 text-sm ${
          bold ? 'font-semibold text-slate-900' : muted ? 'text-slate-400 text-xs' : 'text-slate-700'
        }`}
      >
        {formatCurrencyDetailed(amount)}
      </span>
    </div>
  );
}

function DetailRow({ label, detail, amount }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1 pl-4">
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{label}</div>
        {detail && <div className="text-[11px] text-slate-400 mt-0.5">{detail}</div>}
      </div>
      <span className="tabular-nums shrink-0 text-xs font-medium text-slate-700">
        {formatCurrencyDetailed(amount)}
      </span>
    </div>
  );
}

function EstimatePreviewSidebar({
  materials,
  formState,
  estimate,
  estimateNumber,
  applyGst,
  clientView,
  onToggleClientView,
  onSave,
  onDownloadPdf,
  onPrint,
  onReset,
  saving,
  saveStatus,
  editingId,
}) {
  const company = materials?.company ?? {};
  const productLabel = formState.productType === 'wardrobe' ? 'Wardrobe' : 'Bed';
  const showHardwareBreakdown = estimate.hardwareItems.length > 0;
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="rounded-lg border border-stone-200 bg-white shadow-md overflow-hidden no-print">
      {/* Document header */}
      <div className="bg-navy text-white px-5 py-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/15 text-lg font-bold">
            ₹
          </div>
          <div className="min-w-0">
            <div className="font-bold text-base leading-tight truncate">{company.name || 'Furniture Est'}</div>
            <div className="text-[11px] text-white/65 mt-0.5 leading-snug">
              {company.tagline || 'Particle Board Furniture Manufacturing'}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] uppercase tracking-wider text-white/55">Estimate No.</div>
          <div className="font-bold text-sm mt-0.5 font-mono">{estimateNumber || '—'}</div>
        </div>
      </div>

      {/* Client / product meta */}
      <div className="px-5 py-4 grid grid-cols-2 gap-x-6 gap-y-3 border-b border-stone-100 text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">Product</div>
          <div className="font-medium text-slate-800 capitalize">{formState.productType || '—'}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">Client</div>
          <div className="font-medium text-slate-800 truncate">{formState.clientName || '—'}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">Date</div>
          <div className="font-medium text-slate-800">{today}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">Type / Area</div>
          <div className="font-medium text-slate-800">
            {productLabel} · {estimate.materialTotalArea.toFixed(2)} Sq.Ft.
          </div>
        </div>
      </div>

      {/* Cost breakdown — full height, no inner scroll trap */}
      <div className="px-5 py-4 space-y-4">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
          Cost Breakdown
        </h3>

        <div className="space-y-1">
          <Row label="Material Cost" amount={estimate.materialCost} bold />
          {estimate.materialItems.map((item, i) => (
            <DetailRow
              key={i}
              label={item.name}
              detail={
                item.isFixed
                  ? item.spec
                  : `${item.area.toFixed(2)} sq ft × ${formatCurrencyDetailed(item.rate)}`
              }
              amount={item.cost}
            />
          ))}
        </div>

        {!clientView && (
          <div className="space-y-1">
            <Row label="Labor (45% of material)" amount={estimate.labor.total} bold />
            <Row label="Cutting (15%)" amount={estimate.labor.cutting} muted sub />
            <Row label="Edge Banding (15%)" amount={estimate.labor.edgeBanding} muted sub />
            <Row label="Assembling (15%)" amount={estimate.labor.assembling} muted sub />
          </div>
        )}

        {showHardwareBreakdown && (
          <div className="space-y-1">
            <Row label="Hardware & Accessories" amount={estimate.hardwareCost} bold />
            {estimate.hardwareItems.map((item, i) => (
              <DetailRow
                key={i}
                label={item.name}
                detail={`${item.qty} × ${formatCurrencyDetailed(item.unitPrice)}`}
                amount={item.cost}
              />
            ))}
          </div>
        )}

        {estimate.transportCost > 0 && (
          <Row label="Transport" amount={estimate.transportCost} />
        )}
        {estimate.installationCost > 0 && (
          <Row label="Installation" amount={estimate.installationCost} />
        )}

        <div className="pt-2 border-t border-stone-100 space-y-1.5">
          <Row label="Subtotal" amount={estimate.subtotal} bold />
          {applyGst && <Row label="GST (18%)" amount={estimate.gstAmount} muted />}
          {!clientView && Number(formState.marginPercent) !== 0 && (
            <Row
              label={`${Number(formState.marginPercent) > 0 ? 'Margin' : 'Discount'} (${formState.marginPercent}%)`}
              amount={estimate.marginAmount}
              muted
            />
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg bg-indigo-600 px-4 py-3.5 text-white">
          <span className="font-semibold">Grand Total</span>
          <span className="text-xl font-bold tabular-nums">{formatCurrencyDetailed(estimate.finalPrice)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 space-y-2.5 border-t border-stone-100 pt-4 bg-stone-50/60">
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium text-emerald-700 mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live preview — updates as you type
        </div>

        <button
          type="button"
          onClick={onToggleClientView}
          className={`w-full flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition ${
            clientView
              ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
          }`}
        >
          Client view (hide labor detail)
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {saving ? 'Saving...' : editingId ? 'Update Estimate' : 'Save Estimate'}
        </button>

        {saveStatus === 'saved' && (
          <p className="text-xs text-green-700 text-center">Estimate saved. Form ready for next invoice.</p>
        )}
        {saveStatus === 'updated' && (
          <p className="text-xs text-green-700 text-center">Estimate updated successfully.</p>
        )}
        {saveStatus && saveStatus !== 'saved' && saveStatus !== 'updated' && (
          <p className="text-xs text-red-600 text-center">{saveStatus}</p>
        )}

        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <button
            type="button"
            onClick={onDownloadPdf}
            className="rounded-lg border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            PDF
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="rounded-lg border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            Print
          </button>
          <button
            type="button"
            onClick={onReset}
            title="Reset form"
            className="rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            ↺
          </button>
        </div>
      </div>
    </div>
  );
}

export default EstimatePreviewSidebar;
