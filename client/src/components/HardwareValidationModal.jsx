import { useEffect } from 'react';

function HardwareValidationModal({ errors, onClose, onGoToHardware }) {
  const open = Boolean(errors?.length);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hardware-validation-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-amber-100 bg-amber-50">
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none" aria-hidden="true">
              ⚠️
            </span>
            <h2 id="hardware-validation-title" className="text-base font-bold text-slate-900">
              Cannot save invoice
            </h2>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-stone-600">
            For each enabled Hardware &amp; Accessories category, every type needs a quantity or
            must be marked Unused.
          </p>
          <ul className="max-h-48 overflow-y-auto rounded-lg border border-stone-200 bg-stone-50 divide-y divide-stone-100">
            {errors.map((item, index) => (
              <li key={`${item.category}-${item.typeName}-${index}`} className="px-3 py-2 text-sm text-slate-800">
                <span className="font-semibold">{item.mainLabel}</span>
                <span className="text-stone-400"> — </span>
                <span>{item.typeName}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-5 py-4 border-t border-stone-100 bg-stone-50 flex flex-col-reverse sm:flex-row gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onGoToHardware}
            className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Back to Hardware &amp; Accessories
          </button>
        </div>
      </div>
    </div>
  );
}

export default HardwareValidationModal;
