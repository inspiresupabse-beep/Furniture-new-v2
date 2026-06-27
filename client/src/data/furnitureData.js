export const FurnitureData = {
  boards: {
    box_17mm: ['Century', 'Merino', 'Panalex', 'K-board'],
    door_17mm: ['Century', 'Merino', 'Panalex', 'K-board', 'UV-Finish'],
    board_9mm: ['Century', 'K-board'],
    multiwood: ['17mm', '12mm', '4mm'],
  },
  boardLabels: {
    box_17mm: 'Box Board (17mm)',
    door_17mm: 'Door Board (17mm)',
    board_9mm: 'Backing Board (9mm)',
    multiwood: 'Multiwood',
  },
  hardware: {
    l_clamp: ['4-hole', '2-hole'],
    edge_band: ['2mm', '1.3mm', '0.5mm'],
    locks: { brands: ['Champion', 'Elephant', 'Bonus'], clamps: ['Steel', 'Normal'] },
    hinges: ['Germo', 'Normal', 'Spider', 'Soft-close'],
    bushes: ['Wardrobe', 'Cot', 'Cabinet'],
    sliders: {
      brands: ['Germo', 'Spider', 'Ebco'],
      sizes: ['10 inch', '12 inch', '14 inch'],
    },
    handles: {
      types: [
        'Cabinet (3,4 inch)',
        'Pipe (6,8,16 inch)',
        'V-type Black (2-24 inch)',
        'Wooden (6-24 inch)',
        'Premium Black (4-36 inch)',
        'Premium Gold (4-36 inch)',
      ],
    },
    misc: [
      'Screws',
      'Glue',
      'Foam Fix Glue',
      'Magnets (Heavy/Normal)',
      'Hanger Socket (Premium/Normal)',
      'Legs (Black/Wood/Gold)',
    ],
  },
  hardwareLabels: {
    l_clamp: 'L-Clamp',
    edge_band: 'Edge Band',
    locks: 'Lock',
    hinges: 'Hinge',
    bushes: 'Bush',
    sliders: 'Slider',
    handles: 'Handle',
    misc: 'Miscellaneous',
  },
};

export const defaultBoardMaterial = (category) => ({
  category,
  brand: category === 'multiwood' ? '17mm' : FurnitureData.boards[category][0],
});
