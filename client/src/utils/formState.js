import { createInitialBoardState, fromInches } from './dimensionUtils';
import { getDefaultBedHardwareState, getDefaultWardrobeHardwareState } from './hardwareUtils';

export function createDefaultFormState(materials, hardware, productType = 'wardrobe') {
  const unit = 'inch';
  if (productType === 'bed') {
    const king = materials.bedSizes.king;
    return {
      clientName: '',
      productType: 'bed',
      useStandardSize: true,
      bedSize: 'king',
      dimensionUnit: unit,
      width: fromInches(king.length, unit),
      height: fromInches(king.width, unit),
      depth: fromInches(18, unit),
      shelvesCount: 3,
      wastagePercent: 10,
      doors: 3,
      hasCushionHeadboard: false,
      boardState: createInitialBoardState(materials),
      hardwareState: getDefaultBedHardwareState(hardware),
      transportCost: 0,
      installationCost: 0,
      applyGst: true,
      marginPercent: 0,
    };
  }

  return {
    clientName: '',
    productType: 'wardrobe',
    useStandardSize: false,
    bedSize: 'king',
    dimensionUnit: unit,
    width: fromInches(72, unit),
    height: fromInches(84, unit),
    depth: fromInches(24, unit),
    shelvesCount: 3,
    wastagePercent: 10,
    doors: 3,
    hasCushionHeadboard: false,
    boardState: createInitialBoardState(materials),
    hardwareState: getDefaultWardrobeHardwareState(hardware),
    transportCost: 0,
    installationCost: 0,
    applyGst: true,
    marginPercent: 0,
  };
}

/** Restore a saved estimate into the current catalog shape (boards/hardware keys). */
export function mergeSavedFormState(saved, materials, hardware) {
  const productType = saved?.productType || 'wardrobe';
  const defaults = createDefaultFormState(materials, hardware, productType);

  const boardState = { ...defaults.boardState };
  for (const category of Object.keys(boardState)) {
    const savedCat = saved.boardState?.[category];
    if (savedCat) {
      boardState[category] = {
        enabled: Boolean(savedCat.enabled),
        selectedBrand: savedCat.selectedBrand ?? boardState[category].selectedBrand,
      };
    }
  }

  const hardwareState = { ...defaults.hardwareState };
  for (const category of Object.keys(hardwareState)) {
    const savedSection = saved.hardwareState?.[category];
    if (!savedSection) continue;

    hardwareState[category] = {
      ...hardwareState[category],
      enabled: Boolean(savedSection.enabled),
      entries: { ...hardwareState[category].entries },
    };

    for (const [rateId, savedEntry] of Object.entries(savedSection.entries || {})) {
      if (!hardwareState[category].entries[rateId]) continue;
      hardwareState[category].entries[rateId] = {
        ...hardwareState[category].entries[rateId],
        qty: savedEntry.qty ?? '',
        unitPrice: savedEntry.unitPrice ?? hardwareState[category].entries[rateId].unitPrice,
        unused: Boolean(savedEntry.unused),
      };
    }
  }

  return {
    ...defaults,
    ...saved,
    productType,
    clientName: saved.clientName ?? '',
    dimensionUnit: saved.dimensionUnit ?? defaults.dimensionUnit,
    width: saved.width ?? defaults.width,
    height: saved.height ?? defaults.height,
    depth: saved.depth ?? defaults.depth,
    shelvesCount: saved.shelvesCount ?? defaults.shelvesCount,
    wastagePercent: saved.wastagePercent ?? defaults.wastagePercent,
    doors: saved.doors ?? defaults.doors,
    useStandardSize: saved.useStandardSize ?? defaults.useStandardSize,
    bedSize: saved.bedSize ?? defaults.bedSize,
    hasCushionHeadboard: saved.hasCushionHeadboard ?? defaults.hasCushionHeadboard,
    transportCost: saved.transportCost ?? 0,
    installationCost: saved.installationCost ?? 0,
    applyGst: saved.applyGst ?? defaults.applyGst,
    marginPercent: saved.marginPercent ?? 0,
    boardState,
    hardwareState,
  };
}
