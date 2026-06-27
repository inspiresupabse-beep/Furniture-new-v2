import { useMemo, useState } from 'react';
import { formatCurrencyDetailed } from '../utils/calculations';
import {
  getCategoryTypeCount,
  getCategoriesFromHardware,
  getMainCategoryLabel,
  getTypeDisplayName,
} from '../utils/hardwareUtils';

function HardwareSection({ hardware, value, onChange }) {
  const [search, setSearch] = useState('');

  const categories = useMemo(() => getCategoriesFromHardware(hardware), [hardware]);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((category) => {
      const label = getMainCategoryLabel(category, hardware.hardwareLabels, hardware.hardwareMainLabels).toLowerCase();
      const types = hardware.rates
        .filter((r) => r.category === category)
        .map((r) => getTypeDisplayName(r).toLowerCase());
      return label.includes(term) || types.some((t) => t.includes(term));
    });
  }, [categories, search, hardware]);

  const toggleCategory = (category) => {
    onChange({
      ...value,
      [category]: {
        ...value[category],
        enabled: !value[category].enabled,
      },
    });
  };

  const updateEntry = (category, rateId, patch) => {
    onChange({
      ...value,
      [category]: {
        ...value[category],
        entries: {
          ...value[category].entries,
          [rateId]: { ...value[category].entries[rateId], ...patch },
        },
      },
    });
  };

  const inputClass =
    'w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100';

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-amber-600 text-lg leading-none">🔧</span>
          <h3 className="text-sm font-bold text-slate-800">Hardware & Accessories</h3>
        </div>
        <p className="text-xs text-stone-500 mb-3">
          Search or tick a main item to show its types, then enter quantity and amount.
        </p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">⌕</span>
          <input
            type="text"
            placeholder="Search main items (e.g. hinges, handles, channels)..."
            className="w-full rounded-lg border border-stone-200 bg-stone-50 pl-8 pr-3 py-2 text-xs focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="hidden sm:grid grid-cols-[1fr_72px_96px_72px_88px] gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-stone-400 border-b border-stone-100">
        <span>Main item</span>
        <span className="text-center">Qty</span>
        <span className="text-center">Amount</span>
        <span className="text-center">Total</span>
        <span className="text-center">Skip</span>
      </div>

      <div className="p-3 space-y-2 max-h-[520px] overflow-y-auto">
        {filteredCategories.map((category) => {
          const section = value[category];
          if (!section) return null;

          const categoryRates = hardware.rates.filter((r) => r.category === category);
          const typeCount = getCategoryTypeCount(hardware, category);
          const isExpanded = section.enabled;
          const mainLabel = getMainCategoryLabel(category, hardware.hardwareLabels, hardware.hardwareMainLabels);

          return (
            <div
              key={category}
              className={`rounded-xl border transition-colors ${
                isExpanded
                  ? 'border-amber-400 bg-amber-50/70'
                  : 'border-stone-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={isExpanded}
                  onChange={() => toggleCategory(category)}
                  className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="flex-1 text-left text-xs font-bold uppercase tracking-wide text-amber-700"
                >
                  {mainLabel}
                </button>
                <span className="text-[10px] font-medium text-stone-400 whitespace-nowrap">
                  {typeCount} type{typeCount !== 1 ? 's' : ''}
                </span>
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  {categoryRates.map((rate) => {
                    const entry = section.entries[rate.id];
                    if (!entry) return null;

                    const qty = Number(entry.qty) || 0;
                    const amount = Number(entry.unitPrice) || 0;
                    const total = qty * amount;
                    const typeName = getTypeDisplayName(rate);
                    const catalogPrice = rate.unitPrice;

                    return (
                      <div
                        key={rate.id}
                        className={`grid grid-cols-1 sm:grid-cols-[1fr_72px_96px_72px_88px] gap-2 items-center rounded-lg border px-2.5 py-2 ${
                          entry.unused
                            ? 'border-stone-200 bg-stone-100/80 opacity-60'
                            : 'border-stone-200 bg-white'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-blue-900 truncate">{typeName}</div>
                          <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-0.5">
                            <span>🏷</span>
                            <span className="truncate">
                              {typeName.split(' · ')[0]} · catalog {formatCurrencyDetailed(catalogPrice)}
                            </span>
                          </div>
                        </div>

                        <input
                          type="number"
                          min="0"
                          placeholder="Qty"
                          className={inputClass}
                          value={entry.qty}
                          disabled={entry.unused}
                          onChange={(e) => updateEntry(category, rate.id, { qty: e.target.value })}
                        />

                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Amount"
                            className={`${inputClass} pl-6`}
                            value={entry.unitPrice}
                            disabled={entry.unused}
                            onChange={(e) => updateEntry(category, rate.id, { unitPrice: e.target.value })}
                          />
                        </div>

                        <div className="text-xs font-bold text-slate-800 text-center tabular-nums">
                          {formatCurrencyDetailed(total)}
                        </div>

                        <label className="flex items-center justify-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={entry.unused}
                            onChange={(e) => updateEntry(category, rate.id, { unused: e.target.checked })}
                            className="h-3.5 w-3.5 rounded border-stone-300 text-stone-500 focus:ring-stone-400"
                          />
                          <span className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[10px] text-stone-500">
                            <span>⊘</span>
                            Unused
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-xs text-stone-400">No hardware items match your search.</div>
        )}
      </div>
    </div>
  );
}

export default HardwareSection;
