import { formatCurrency } from '../utils/calculations';

function EstimateActionPanel({
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
  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden no-print">
      <div className="p-5 space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span className="tabular-nums font-medium">{formatCurrency(estimate.subtotal)}</span>
          </div>
          {applyGst && (
            <div className="flex justify-between text-stone-600">
              <span>GST (18%)</span>
              <span className="tabular-nums font-medium">{formatCurrency(estimate.gstAmount)}</span>
            </div>
          )}
          {Number(estimate.marginAmount) !== 0 && (
            <div className="flex justify-between text-stone-600">
              <span>Margin / Discount</span>
              <span className="tabular-nums font-medium">{formatCurrency(estimate.marginAmount)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg bg-blue-600 px-4 py-3 text-white">
          <span className="font-semibold">Grand Total</span>
          <span className="text-lg font-bold tabular-nums">{formatCurrency(estimate.finalPrice)}</span>
        </div>

        <button
          type="button"
          onClick={onToggleClientView}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
        >
          <span>{clientView ? '👁‍🗨' : '👁'}</span>
          Client view (hide labor detail)
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
        >
          <span>💾</span>
          {saving ? 'Saving...' : editingId ? 'Update Estimate' : 'Save Estimate'}
        </button>

        {saveStatus === 'saved' && (
          <p className="text-sm text-green-700 text-center">Estimate saved successfully.</p>
        )}
        {saveStatus && saveStatus !== 'saved' && (
          <p className="text-sm text-red-600 text-center">{saveStatus}</p>
        )}

        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <button
            type="button"
            onClick={onDownloadPdf}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            <span>📄</span> PDF
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            <span>🖨</span> Print
          </button>
          <button
            type="button"
            onClick={onReset}
            title="Reset form"
            className="flex items-center justify-center rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            ↺
          </button>
        </div>
      </div>
    </div>
  );
}

export default EstimateActionPanel;
