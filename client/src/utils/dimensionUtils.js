export const DIMENSION_UNITS = ['inch', 'cm', 'ft'];

export const UNIT_LABELS = {
  inch: 'Inch',
  cm: 'Cm',
  ft: 'Ft',
};

const TO_INCH = {
  inch: 1,
  cm: 1 / 2.54,
  ft: 12,
};

export function toInches(value, unit = 'inch') {
  return (Number(value) || 0) * (TO_INCH[unit] ?? 1);
}

export function fromInches(inches, unit = 'inch') {
  const factor = TO_INCH[unit] ?? 1;
  return factor ? inches / factor : 0;
}

export function convertDimension(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) return Number(value) || 0;
  return fromInches(toInches(value, fromUnit), toUnit);
}

export function getDimensionsInInches(formState) {
  const unit = formState.dimensionUnit || 'inch';
  return {
    length: toInches(formState.width, unit),
    width: toInches(formState.depth, unit),
    height: toInches(formState.height, unit),
  };
}

export function formatDimension(value, unit = 'inch', decimals = 2) {
  return `${Number(value).toFixed(decimals)} ${unit}`;
}

export function createInitialBoardState(materials) {
  const state = {};
  for (const category of Object.keys(materials.catalog.boards)) {
    const brands = materials.catalog.boards[category];
    state[category] = {
      enabled: category !== 'multiwood',
      selectedBrand: brands[0],
    };
  }
  return state;
}

export function boardStateToMaterials(boardState) {
  return {
    bodyMaterial: {
      category: 'box_17mm',
      brand: boardState.box_17mm?.selectedBrand || 'Century',
    },
    doorMaterial: {
      category: 'door_17mm',
      brand: boardState.door_17mm?.selectedBrand || 'Century',
    },
    backMaterial: {
      category: 'board_9mm',
      brand: boardState.board_9mm?.selectedBrand || 'Century',
    },
    multiwoodMaterial: {
      category: 'multiwood',
      brand: boardState.multiwood?.selectedBrand || '17mm',
    },
    useMultiwood: boardState.multiwood?.enabled ?? false,
  };
}

export function getBoardMainLabel(category, materials) {
  const labels = {
    box_17mm: 'BOX 17 MM PARTICLE BOARD',
    door_17mm: 'DOOR 17 MM PARTICLE BOARD',
    board_9mm: 'BACK 9 MM BOARD',
    multiwood: 'MULTIWOOD',
  };
  return labels[category] || (materials.catalog.boardLabels[category] || category).toUpperCase();
}
