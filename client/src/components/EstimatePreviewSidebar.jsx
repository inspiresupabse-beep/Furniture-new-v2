import { formatCurrency, formatCurrencyDetailed } from '../utils/calculations';

function BreakdownLine({ label, detail, amount, muted }) {
  return (
    <div className={`py-1.5 ${muted ? 'text-stone-400' : 'text-stone-600'}`}>
      <div className="text-xs font-medium text-stone-700">{label}</div>
      {detail && <div className="text-[11px] text-stone-400 mt-0.5">{detail}</div>}
      <div className="text-xs font-semibold text-stone-800 tabular-nums text-right -mt-4">
        {formatCurrencyDetailed(amount)}
      </div>
    </div>
  );
}

function EstimatePreviewSidebar({
  formState,
  estimate,
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
  const productLabel = formState.productType === 'wardrobe' ? 'Wardrobe' : 'Bed';
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden no-print">
      <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/80 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-stone-400">Product</div>
          <div className="font-semibold text-stone-800 capitalize">{formState.productType || '—'}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-stone-400">Client</div>
          <div className="font-medium text-stone-700 truncate">{formState.clientName || '—'}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-stone-400">Date</div>
          <div className="font-medium text-stone-700">{today}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-stone-400">Type / Area</div>
          <div className="font-medium text-stone-700">
            {productLabel} · {estimate.materialTotalArea.toFixed(2)} sq ft
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-h-[calc(100vh-420px)] overflow-y-auto">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
          Cost Breakdown
        </h3>

        <div>
          <div className="flex items-center justify-between text-sm font-semibold text-stone-800 mb-2">
            <span>Material Cost</span>
            <span className="tabular-nums">{formatCurrencyDetailed(estimate.materialCost)}</span>
          </div>
          <div className="space-y-1 border-l-2 border-indigo-100 pl-3 ml-0.5">
            {estimate.materialItems.map((item, i) => (
              <BreakdownLine
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
        </div>

        {!clientView && (
          <div>
            <div className="flex items-center justify-between text-sm font-semibold text-stone-800 mb-2">
              <span>Labor (45% of material)</span>
              <span className="tabular-nums">{formatCurrencyDetailed(estimate.labor.total)}</span>
            </div>
            <div className="space-y-1 border-l-2 border-indigo-100 pl-3 ml-0.5 text-xs text-stone-500">
              <div className="flex justify-between py-1">
                <span>Cutting (15%)</span>
                <span className="tabular-nums font-medium text-stone-700">
                  {formatCurrencyDetailed(estimate.labor.cutting)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Edge Banding (15%)</span>
                <span className="tabular-nums font-medium text-stone-700">
                  {formatCurrencyDetailed(estimate.labor.edgeBanding)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Assembling (15%)</span>
                <span className="tabular-nums font-medium text-stone-700">
                  {formatCurrencyDetailed(estimate.labor.assembling)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between text-sm font-semibold text-stone-800 mb-2">
            <span>Hardware & Accessories</span>
            <span className="tabular-nums">{formatCurrencyDetailed(estimate.hardwareCost)}</span>
          </div>
          {estimate.hardwareItems.length > 0 ? (
            <div className="space-y-1 border-l-2 border-indigo-100 pl-3 ml-0.5">
              {estimate.hardwareItems.map((item, i) => (
                <BreakdownLine
                  key={i}
                  label={item.name}
                  detail={`${item.qty} × ${formatCurrencyDetailed(item.unitPrice)}`}
                  amount={item.cost}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400 pl-3 border-l-2 border-indigo-100 ml-0.5">
              No hardware selected
            </p>
          )}
        </div>

        {estimate.transportCost > 0 && (
          <div className="flex justify-between text-sm text-stone-700">
            <span>Transport</span>
            <span className="tabular-nums font-medium">{formatCurrency(estimate.transportCost)}</span>
          </div>
        )}
        {estimate.installationCost > 0 && (
          <div className="flex justify-between text-sm text-stone-700">
            <span>Installation</span>
            <span className="tabular-nums font-medium">{formatCurrency(estimate.installationCost)}</span>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 space-y-3 border-t border-stone-100 pt-4 bg-stone-50/50">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span className="tabular-nums font-medium">{formatCurrencyDetailed(estimate.subtotal)}</span>
          </div>
          {applyGst && (
            <div className="flex justify-between text-stone-500">
              <span>GST (18%)</span>
              <span className="tabular-nums">{formatCurrencyDetailed(estimate.gstAmount)}</span>
            </div>
          )}
          {!clientView && Number(formState.marginPercent) !== 0 && (
            <div className="flex justify-between text-stone-500">
              <span>
                {Number(formState.marginPercent) > 0 ? 'Margin' : 'Discount'} ({formState.marginPercent}%)
              </span>
              <span className="tabular-nums">{formatCurrencyDetailed(estimate.marginAmount)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl bg-indigo-600 px-4 py-3.5 text-white shadow-sm">
          <span className="font-semibold">Grand Total</span>
          <span className="text-xl font-bold tabular-nums">{formatCurrencyDetailed(estimate.finalPrice)}</span>
        </div>

        <button
          type="button"
          onClick={onToggleClientView}
          className={`w-full flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${
            clientView
              ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
          }`}
        >
          <span>👁</span>
          Client view (hide labor detail)
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-60 shadow-sm"
        >
          <span>💾</span>
          {saving ? 'Saving...' : editingId ? 'Update Estimate' : 'Save Estimate'}
        </button>

        {saveStatus === 'saved' && (
          <p className="text-xs text-green-700 text-center">Estimate saved successfully.</p>
        )}
        {saveStatus && saveStatus !== 'saved' && (
          <p className="text-xs text-red-600 text-center">{saveStatus}</p>
        )}

        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <button
            type="button"
            onClick={onDownloadPdf}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            <span>📄</span> PDF
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            <span>🖨</span> Print
          </button>
          <button
            type="button"
            onClick={onReset}
            title="Reset form"
            className="flex items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            ↺
          </button>
        </div>
      </div>
    </div>
  );
}

export default EstimatePreviewSidebar;
