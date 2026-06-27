export function findHardwareRate(rates, item) {
  return rates.find((r) => {
    if (r.category !== item.category) return false;
    switch (item.category) {
      case 'locks':
        return r.brand === item.brand && r.clamp === item.clamp;
      case 'sliders':
        return r.brand === item.brand && r.size === item.size;
      case 'handles':
        return r.handleType === item.handleType;
      case 'l_clamp':
      case 'edge_band':
      case 'hinges':
      case 'bushes':
      case 'misc':
        return r.variant === item.variant;
      default:
        return false;
    }
  });
}

export function getTypeDisplayName(rate) {
  switch (rate.category) {
    case 'locks':
      return `${rate.brand} (${rate.clamp})`;
    case 'sliders':
      return `${rate.brand} · ${rate.size}`;
    case 'handles':
      return rate.handleType;
    default:
      return rate.variant;
  }
}

export function getMainCategoryLabel(category, labels = {}, mainLabels = {}) {
  if (mainLabels[category]) return mainLabels[category];
  return (labels[category] || category).toUpperCase();
}

export function formatHardwareName(item, labels = {}) {
  const label = labels[item.category] || item.category;
  const typeName = item.displayName || getTypeDisplayName(item);
  return `${label} — ${typeName}`;
}

export function createInitialHardwareState(hardware) {
  const state = {};
  const categories = [...new Set(hardware.rates.map((r) => r.category))];

  for (const category of categories) {
    const categoryRates = hardware.rates.filter((r) => r.category === category);
    state[category] = {
      enabled: false,
      entries: Object.fromEntries(
        categoryRates.map((rate) => [
          rate.id,
          { qty: '', unitPrice: rate.unitPrice, unused: false },
        ])
      ),
    };
  }

  return state;
}

function applyPreset(state, presets) {
  const next = JSON.parse(JSON.stringify(state));
  for (const preset of presets) {
    if (!next[preset.category]?.entries[preset.rateId]) continue;
    next[preset.category].enabled = true;
    next[preset.category].entries[preset.rateId].qty = preset.qty;
  }
  return next;
}

export function getDefaultWardrobeHardwareState(hardware) {
  const base = createInitialHardwareState(hardware);
  return applyPreset(base, [
    { category: 'hinges', rateId: 'hg4', qty: 4 },
    { category: 'locks', rateId: 'lk1', qty: 1 },
    { category: 'handles', rateId: 'hd5', qty: 4 },
    { category: 'bushes', rateId: 'bs1', qty: 8 },
    { category: 'edge_band', rateId: 'eb1', qty: 1 },
  ]);
}

export function getDefaultBedHardwareState(hardware) {
  const base = createInitialHardwareState(hardware);
  return applyPreset(base, [
    { category: 'hinges', rateId: 'hg2', qty: 4 },
    { category: 'bushes', rateId: 'bs2', qty: 6 },
    { category: 'misc', rateId: 'mc1', qty: 1 },
    { category: 'misc', rateId: 'mc2', qty: 1 },
  ]);
}

export function hardwareStateToItems(state, hardware) {
  const items = [];

  for (const rate of hardware.rates) {
    const section = state[rate.category];
    if (!section?.enabled) continue;

    const entry = section.entries[rate.id];
    if (!entry || entry.unused) continue;

    const qty = Number(entry.qty) || 0;
    if (qty <= 0) continue;

    items.push({
      ...rate,
      qty,
      unitPrice: Number(entry.unitPrice) || rate.unitPrice,
      displayName: getTypeDisplayName(rate),
    });
  }

  return items;
}

export function resolveHardwareLine(item, hardware) {
  const rate = findHardwareRate(hardware.rates, item);
  const name = item.displayName
    ? `${hardware.hardwareLabels[item.category] || item.category} — ${item.displayName}`
    : formatHardwareName(item, hardware.hardwareLabels);
  const unitPrice = Number(item.unitPrice) || rate?.unitPrice || 0;
  const qty = Number(item.qty) || 0;
  return { name, qty, unitPrice, cost: qty * unitPrice };
}

export function getCategoryTypeCount(hardware, category) {
  return hardware.rates.filter((r) => r.category === category).length;
}

export function getCategoriesFromHardware(hardware) {
  return [...new Set(hardware.rates.map((r) => r.category))];
}
