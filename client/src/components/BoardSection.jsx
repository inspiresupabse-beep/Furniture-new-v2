import { useMemo, useState } from 'react';
import { formatCurrencyDetailed } from '../utils/calculations';
import { getBoardMainLabel } from '../utils/dimensionUtils';

function BoardSection({ materials, value, onChange, productType }) {
  const [search, setSearch] = useState('');

  const categories = useMemo(() => {
    const all = Object.keys(materials.catalog.boards);
    if (productType === 'bed') {
      return all.filter((c) => c === 'box_17mm');
    }
    return all;
  }, [materials, productType]);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((category) => {
      const label = getBoardMainLabel(category, materials).toLowerCase();
      const brands = materials.catalog.boards[category].map((b) => b.toLowerCase());
      return label.includes(term) || brands.some((b) => b.includes(term));
    });
  }, [categories, search, materials]);

  const toggleCategory = (category) => {
    onChange({
      ...value,
      [category]: {
        ...value[category],
        enabled: !value[category]?.enabled,
      },
    });
  };

  const selectBrand = (category, brand) => {
    onChange({
      ...value,
      [category]: {
        ...value[category],
        enabled: true,
        selectedBrand: brand,
      },
    });
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-amber-600 text-lg leading-none">📋</span>
          <h3 className="text-sm font-bold text-slate-800">Board Materials</h3>
        </div>
        <p className="text-xs text-stone-500 mb-3">
          Tick a main board item to show its types, then select the brand for each board.
        </p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">⌕</span>
          <input
            type="text"
            placeholder="Search boards (e.g. box, door, century)..."
            className="w-full rounded-lg border border-stone-200 bg-stone-50 pl-8 pr-3 py-2 text-xs focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="hidden sm:grid grid-cols-[1fr_120px] gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-stone-400 border-b border-stone-100">
        <span>Main item / Type</span>
        <span className="text-center">Catalog rate</span>
      </div>

      <div className="p-3 space-y-2">
        {filteredCategories.map((category) => {
          const section = value[category] || { enabled: false, selectedBrand: '' };
          const brands = materials.catalog.boards[category] || [];
          const isExpanded = section.enabled;
          const mainLabel = getBoardMainLabel(category, materials);

          return (
            <div
              key={category}
              className={`rounded-xl border transition-colors ${
                isExpanded ? 'border-amber-400 bg-amber-50/70' : 'border-stone-200 bg-white'
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
                  {brands.length} type{brands.length !== 1 ? 's' : ''}
                </span>
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  {brands.map((brand) => {
                    const rate = materials.rates.find(
                      (r) => r.category === category && r.brand === brand
                    );
                    const isSelected = section.selectedBrand === brand;

                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => selectBrand(category, brand)}
                        className={`w-full grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-2 items-center rounded-lg border px-2.5 py-2 text-left transition ${
                          isSelected
                            ? 'border-amber-500 bg-white ring-2 ring-amber-200'
                            : 'border-stone-200 bg-white hover:border-amber-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-blue-900">{brand}</div>
                          <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-0.5">
                            <span>🏷</span>
                            <span>
                              {brand} · catalog {formatCurrencyDetailed(rate?.pricePerSqft ?? 0)}/sq.ft
                            </span>
                          </div>
                        </div>
                        <div className="text-xs font-bold text-slate-800 text-center tabular-nums">
                          {formatCurrencyDetailed(rate?.pricePerSqft ?? 0)}/sq.ft
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BoardSection;
