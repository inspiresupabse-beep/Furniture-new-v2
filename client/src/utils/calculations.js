import { hardwareStateToItems, resolveHardwareLine } from './hardwareUtils';
import { getDimensionsInInches, boardStateToMaterials, fromInches } from './dimensionUtils';

export const sqInToSqFt = (sqIn) => sqIn / 144;

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

export const formatCurrencyDetailed = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

export function getTotalMaterialArea(items) {
  return items.filter((item) => !item.isFixed).reduce((sum, item) => sum + item.area, 0);
}

export function getBoardRate(materials, selection) {
  if (!selection) return 0;
  const rate = materials.rates.find(
    (r) => r.category === selection.category && r.brand === selection.brand
  );
  return rate?.pricePerSqft ?? 0;
}

export function getBoardLabel(materials, selection) {
  if (!selection) return 'Not selected';
  const categoryLabel = materials.catalog.boardLabels[selection.category] || selection.category;
  const brandLabel = selection.brand;
  return `${categoryLabel} — ${brandLabel}`;
}

export function calculateWardrobeMaterial(params) {
  const { length, width, height, doors, shelvesCount, dimensionUnit, bodyMaterial, doorMaterial, backMaterial, multiwoodMaterial, materials } = params;
  const unit = dimensionUnit || 'inch';
  // length = Width (horizontal), width = Depth (front-to-back), height = Height (vertical)
  const wardrobeWidth = Number(length) || 0;
  const depth = Number(width) || 0;
  const wardrobeHeight = Number(height) || 0;
  const doorCount = Math.max(Number(doors) || 1, 1);
  const shelfCount = Number(shelvesCount) || 0;

  const bodyRate = getBoardRate(materials, bodyMaterial);
  const doorRate = getBoardRate(materials, doorMaterial);
  const backRate = getBoardRate(materials, backMaterial);
  const multiwoodRate = multiwoodMaterial ? getBoardRate(materials, multiwoodMaterial) : 0;

  const sidePanels = 2 * sqInToSqFt(depth * wardrobeHeight);
  const topBottom = 2 * sqInToSqFt(wardrobeWidth * depth);
  const partitions = (doorCount - 1) * sqInToSqFt(depth * wardrobeHeight);
  const compartmentWidthIn = wardrobeWidth / doorCount;
  const shelfAreaSqIn = compartmentWidthIn * depth * shelfCount;
  // (Width ÷ Doors) × Depth ÷ 144 × Shelves = sq ft (calc always in inch)
  const shelves = shelfAreaSqIn / 144;

  const displayWidth = fromInches(wardrobeWidth, unit);
  const displayDepth = fromInches(depth, unit);

  const shelfDimensionNote = `(Width ${displayWidth.toFixed(1)} ${unit} ÷ ${doorCount} doors × Depth ${displayDepth.toFixed(1)} ${unit} × ${shelfCount} shelves)`;

  const doorArea = doorCount * sqInToSqFt((wardrobeWidth / doorCount) * wardrobeHeight);
  const backPanel = sqInToSqFt(wardrobeWidth * wardrobeHeight);
  const multiwoodArea = multiwoodMaterial ? sqInToSqFt(wardrobeWidth * wardrobeHeight) * 0.15 : 0;

  const items = [
    { name: 'Side Panels', area: sidePanels, rate: bodyRate, cost: sidePanels * bodyRate, spec: getBoardLabel(materials, bodyMaterial) },
    { name: 'Top / Bottom', area: topBottom, rate: bodyRate, cost: topBottom * bodyRate, spec: getBoardLabel(materials, bodyMaterial) },
    { name: 'Partitions', area: partitions, rate: bodyRate, cost: partitions * bodyRate, spec: getBoardLabel(materials, bodyMaterial) },
    {
      name: 'Shelves / Racks',
      area: shelves,
      dimensionNote: shelfDimensionNote,
      rate: bodyRate,
      cost: shelves * bodyRate,
      spec: getBoardLabel(materials, bodyMaterial),
    },
    { name: 'Doors', area: doorArea, rate: doorRate, cost: doorArea * doorRate, spec: getBoardLabel(materials, doorMaterial) },
    { name: 'Back Panel', area: backPanel, rate: backRate, cost: backPanel * backRate, spec: getBoardLabel(materials, backMaterial) },
  ];

  if (multiwoodMaterial && multiwoodArea > 0) {
    items.push({
      name: 'Multiwood Trim',
      area: multiwoodArea,
      rate: multiwoodRate,
      cost: multiwoodArea * multiwoodRate,
      spec: getBoardLabel(materials, multiwoodMaterial),
    });
  }

  const totalMaterial = items.reduce((sum, item) => sum + item.cost, 0);
  return { items, totalMaterial };
}

export function calculateBedMaterial(params) {
  const { length, width, height, hasCushionHeadboard, bodyMaterial, materials } = params;
  const L = Number(length) || 0;
  const W = Number(width) || 0;
  const H = Number(height) || 0;

  const bodyRate = getBoardRate(materials, bodyMaterial);
  const bodySpec = getBoardLabel(materials, bodyMaterial);

  const platform = sqInToSqFt(L * W);
  const sideRails = 2 * sqInToSqFt(L * H);
  const footboard = sqInToSqFt(W * H);
  const headboard = sqInToSqFt(W * (H + 12));

  const items = [
    { name: 'Platform Base', area: platform, rate: bodyRate, cost: platform * bodyRate, spec: bodySpec },
    { name: 'Side Rails (×2)', area: sideRails, rate: bodyRate, cost: sideRails * bodyRate, spec: bodySpec },
    { name: 'Footboard', area: footboard, rate: bodyRate, cost: footboard * bodyRate, spec: bodySpec },
    { name: 'Headboard', area: headboard, rate: bodyRate, cost: headboard * bodyRate, spec: bodySpec },
  ];

  let totalMaterial = items.reduce((sum, item) => sum + item.cost, 0);

  if (hasCushionHeadboard) {
    const cushionCost = materials.cushionHeadboardCost || 3500;
    items.push({ name: 'Cushion Headboard', area: 0, rate: 0, cost: cushionCost, isFixed: true, spec: 'Fixed add-on' });
    totalMaterial += cushionCost;
  }

  return { items, totalMaterial };
}

export function applyMaterialWastage(items, wastagePercent, defaultRate) {
  const pct = Number(wastagePercent) || 0;
  const baseArea = getTotalMaterialArea(items);

  if (pct <= 0) {
    return {
      items,
      wastageArea: 0,
      wastageCost: 0,
      wastagePercent: 0,
      materialTotalArea: baseArea,
      totalMaterial: items.reduce((sum, item) => sum + item.cost, 0),
    };
  }

  const wastageArea = baseArea * (pct / 100);
  const rate = defaultRate || 0;
  const wastageCost = wastageArea * rate;

  const nextItems = [
    ...items,
    {
      name: 'Material Wastage',
      area: wastageArea,
      rate,
      cost: wastageCost,
      spec: `${pct}% of ${baseArea.toFixed(2)} sq ft`,
      isWastage: true,
    },
  ];

  return {
    items: nextItems,
    wastageArea,
    wastageCost,
    wastagePercent: pct,
    materialTotalArea: baseArea + wastageArea,
    totalMaterial: nextItems.reduce((sum, item) => sum + item.cost, 0),
  };
}

export function calculateLabor(materialCost) {
  const total = materialCost * 0.45;
  return {
    total,
    cutting: materialCost * 0.15,
    edgeBanding: materialCost * 0.15,
    assembling: materialCost * 0.15,
  };
}

export function calculateFinalPrice({
  materialCost,
  laborCost,
  hardwareCost,
  transportCost,
  installationCost,
  applyGst,
  marginPercent,
}) {
  const subtotal = materialCost + laborCost + hardwareCost + transportCost + installationCost;
  const afterGst = applyGst ? subtotal * 1.18 : subtotal;
  const gstAmount = applyGst ? subtotal * 0.18 : 0;
  const finalPrice = afterGst * (1 + (Number(marginPercent) || 0) / 100);
  const marginAmount = afterGst * ((Number(marginPercent) || 0) / 100);

  return { subtotal, gstAmount, afterGst, marginAmount, finalPrice };
}

export function calculateEstimate(formState, materials, hardwareConfig) {
  let materialResult;
  const dims = getDimensionsInInches(formState);
  const boards = boardStateToMaterials(formState.boardState);

  if (formState.productType === 'wardrobe') {
    materialResult = calculateWardrobeMaterial({
      ...dims,
      doors: formState.doors,
      shelvesCount: formState.shelvesCount,
      dimensionUnit: formState.dimensionUnit,
      bodyMaterial: boards.bodyMaterial,
      doorMaterial: boards.doorMaterial,
      backMaterial: boards.backMaterial,
      multiwoodMaterial: boards.useMultiwood ? boards.multiwoodMaterial : null,
      materials,
    });
  } else {
    materialResult = calculateBedMaterial({
      ...dims,
      hasCushionHeadboard: formState.hasCushionHeadboard,
      bodyMaterial: boards.bodyMaterial,
      materials,
    });
  }

  const bodyRate = getBoardRate(materials, boards.bodyMaterial);
  const withWastage = applyMaterialWastage(
    materialResult.items,
    formState.wastagePercent,
    bodyRate
  );

  const labor = calculateLabor(withWastage.totalMaterial);
  const hardwareItems = hardwareStateToItems(formState.hardwareState, hardwareConfig).map((item) =>
    resolveHardwareLine(item, hardwareConfig)
  );
  const hardwareCost = hardwareItems.reduce((sum, h) => sum + h.cost, 0);
  const transportCost = Number(formState.transportCost) || 0;
  const installationCost = Number(formState.installationCost) || 0;

  const pricing = calculateFinalPrice({
    materialCost: withWastage.totalMaterial,
    laborCost: labor.total,
    hardwareCost,
    transportCost,
    installationCost,
    applyGst: formState.applyGst,
    marginPercent: formState.marginPercent,
  });

  return {
    materialItems: withWastage.items,
    materialCost: withWastage.totalMaterial,
    materialTotalArea: withWastage.materialTotalArea,
    wastageArea: withWastage.wastageArea,
    wastageCost: withWastage.wastageCost,
    wastagePercent: withWastage.wastagePercent ?? (Number(formState.wastagePercent) || 0),
    labor,
    hardwareItems,
    hardwareCost,
    transportCost,
    installationCost,
    ...pricing,
  };
}
