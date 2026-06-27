import { DIMENSION_UNITS, UNIT_LABELS } from '../utils/dimensionUtils';

function DimensionSection({
  formState,
  materials,
  onUpdate,
  onUnitChange,
  onStandardSizeToggle,
  onBedSizeChange,
  embedded = false,
}) {
  const inputClass =
    'w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100 disabled:opacity-60';

  const content = (
    <div className={embedded ? 'space-y-4' : 'p-4 space-y-4'}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Size Mode</label>
            <div className="flex rounded-lg border border-stone-200 bg-stone-50 p-0.5 gap-0.5">
              {[
                { key: true, label: 'Standard' },
                { key: false, label: 'Custom' },
              ].map(({ key, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onStandardSizeToggle(key)}
                  className={`flex-1 rounded-md py-2 text-xs font-medium transition ${
                    formState.useStandardSize === key ? 'bg-white shadow text-navy' : 'text-stone-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {formState.productType === 'bed' && formState.useStandardSize && (
            <div>
              <label className="block text-xs font-medium mb-1">Bed Size</label>
              <select
                className={inputClass}
                value={formState.bedSize}
                onChange={(e) => onBedSizeChange(e.target.value)}
              >
                {Object.entries(materials.bedSizes).map(([key, size]) => (
                  <option key={key} value={key}>{size.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1">Unit</label>
            <div className="flex rounded-lg border border-stone-200 bg-stone-50 p-0.5 gap-0.5">
              {DIMENSION_UNITS.map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => onUnitChange(unit)}
                  className={`flex-1 rounded-md py-2 text-xs font-medium transition ${
                    formState.dimensionUnit === unit ? 'bg-white shadow text-navy' : 'text-stone-500'
                  }`}
                >
                  {UNIT_LABELS[unit]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { key: 'width', label: 'Width' },
            { key: 'height', label: 'Height' },
            { key: 'depth', label: 'Depth' },
          ].map(({ key, label }) => (
            <div key={key} className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-amber-800 mb-2">
                {label} ({formState.dimensionUnit})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                value={formState[key]}
                disabled={
                  formState.useStandardSize &&
                  formState.productType === 'bed' &&
                  key !== 'depth'
                }
                onChange={(e) => onUpdate({ [key]: e.target.value })}
              />
            </div>
          ))}

          {formState.productType === 'wardrobe' && (
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-amber-800 mb-2">
                Shelves / Racks ({formState.dimensionUnit})
              </label>
              <input
                type="number"
                step="1"
                min="0"
                className={inputClass}
                value={formState.shelvesCount}
                onChange={(e) => onUpdate({ shelvesCount: e.target.value })}
              />
            </div>
          )}

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-amber-800 mb-2">
              Wastage (%)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="100"
              className={inputClass}
              value={formState.wastagePercent}
              onChange={(e) => onUpdate({ wastagePercent: e.target.value })}
              placeholder="e.g. 10"
            />
            <p className="text-[10px] text-stone-400 mt-1.5">Applied on total sq ft</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {formState.productType === 'wardrobe' && (
            <div>
              <label className="block text-xs font-medium mb-1">Number of Doors</label>
              <div className="flex rounded-lg border border-stone-200 bg-stone-50 p-0.5 gap-0.5">
                {[2, 3, 4].map((d) => (
                  <button
                    key={d}
                    type="button"
                        onClick={() => onUpdate({ doors: d, shelvesCount: d })}
                    className={`flex-1 rounded-md py-2 text-xs font-medium transition ${
                      formState.doors === d ? 'bg-white shadow text-navy' : 'text-stone-500'
                    }`}
                  >
                    {d} Door
                  </button>
                ))}
              </div>
            </div>
          )}

          {formState.productType === 'bed' && (
            <label className="flex items-center gap-2.5 cursor-pointer rounded-lg border border-stone-200 bg-stone-50 px-3 py-3">
              <input
                type="checkbox"
                className="toggle-input"
                checked={formState.hasCushionHeadboard}
                onChange={(e) => onUpdate({ hasCushionHeadboard: e.target.checked })}
              />
              <span className="toggle-track" />
              <span className="text-xs font-medium">
                Cushion Headboard (+₹{materials.cushionHeadboardCost})
              </span>
            </label>
          )}
        </div>
      </div>
  );

  if (embedded) {
    return (
      <div className="rounded-xl border border-stone-200 bg-stone-50/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 bg-white">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-800">Dimensions</h4>
          <p className="text-xs text-stone-500 mt-0.5">
            Enter width, height and depth, then choose cm, inch or ft.
          </p>
        </div>
        <div className="p-4">{content}</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-amber-600 text-lg leading-none">📐</span>
          <h3 className="text-sm font-bold text-slate-800">Material Module</h3>
        </div>
        <p className="text-xs text-stone-500">
          Enter width, height and depth, then choose cm, inch or ft.
        </p>
      </div>
      {content}
    </div>
  );
}

export default DimensionSection;
