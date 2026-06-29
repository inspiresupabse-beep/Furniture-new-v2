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
      enabled: false,
      selectedBrand: brands[0],
    };
  }
  return state;
}

export function boardStateToMaterials(boardState) {
  const pick = (category) =>
    boardState[category]?.enabled
      ? { category, brand: boardState[category].selectedBrand }
      : null;

  return {
    bodyMaterial: pick('box_17mm'),
    doorMaterial: pick('door_17mm'),
    backMaterial: pick('board_9mm'),
    multiwoodMaterial: pick('multiwood'),
    useMultiwood: boardState.multiwood?.enabled ?? false,
  };
}

export function hasMaterialDetails(formState) {
  const boards = formState.boardState || {};
  const anyBoard = Object.values(boards).some((entry) => entry?.enabled);
  if (anyBoard) return true;

  const hardware = formState.hardwareState || {};
  return Object.values(hardware).some((section) => {
    if (!section?.enabled) return false;
    return Object.values(section.entries || {}).some(
      (entry) => !entry?.unused && Number(entry?.qty) > 0
    );
  });
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
