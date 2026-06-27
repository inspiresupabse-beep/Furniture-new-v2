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
      boardState: {
        ...createInitialBoardState(materials),
        box_17mm: { enabled: true, selectedBrand: 'Century' },
      },
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
