export const TILE_SIZE_UNIT = 50;
export const TILE_X_LENGTH = 120;
export const TILE_Y_LENGTH = 90;

export interface TileTypeDefinition {
    label: string;
    width: number;
    height: number;
    colorPos: string;
    colorNeg: string;
    borderColor: string;
    borderColorNeg: string;
}

export const TILE_TYPES: Record<string, TileTypeDefinition> = {
    // X Family
    x2: {
        label: 'x²',
        width: TILE_X_LENGTH,
        height: TILE_X_LENGTH,
        colorPos: 'bg-blue-500',
        colorNeg: 'bg-red-500',
        borderColor: 'border-blue-700',
        borderColorNeg: 'border-red-700'
    },
    x: {
        label: 'x',
        width: TILE_SIZE_UNIT,
        height: TILE_X_LENGTH,
        colorPos: 'bg-green-500',
        colorNeg: 'bg-red-500',
        borderColor: 'border-green-700',
        borderColorNeg: 'border-red-700'
    },
    x_h: {
        label: 'x',
        width: TILE_X_LENGTH,
        height: TILE_SIZE_UNIT,
        colorPos: 'bg-green-500',
        colorNeg: 'bg-red-500',
        borderColor: 'border-green-700',
        borderColorNeg: 'border-red-700'
    },
    // Y Family
    y2: {
        label: 'y²',
        width: TILE_Y_LENGTH,
        height: TILE_Y_LENGTH,
        colorPos: 'bg-purple-500',
        colorNeg: 'bg-red-500',
        borderColor: 'border-purple-700',
        borderColorNeg: 'border-red-700'
    },
    y: {
        label: 'y',
        width: TILE_SIZE_UNIT,
        height: TILE_Y_LENGTH,
        colorPos: 'bg-orange-400',
        colorNeg: 'bg-red-500',
        borderColor: 'border-orange-600',
        borderColorNeg: 'border-red-700'
    },
    y_h: {
        label: 'y',
        width: TILE_Y_LENGTH,
        height: TILE_SIZE_UNIT,
        colorPos: 'bg-orange-400',
        colorNeg: 'bg-red-500',
        borderColor: 'border-orange-600',
        borderColorNeg: 'border-red-700'
    },
    // XY Family
    xy: {
        label: 'xy',
        width: TILE_X_LENGTH,
        height: TILE_Y_LENGTH,
        colorPos: 'bg-teal-500',
        colorNeg: 'bg-red-500',
        borderColor: 'border-teal-700',
        borderColorNeg: 'border-red-700'
    },
    xy_h: {
        label: 'xy',
        width: TILE_Y_LENGTH,
        height: TILE_X_LENGTH,
        colorPos: 'bg-teal-500',
        colorNeg: 'bg-red-500',
        borderColor: 'border-teal-700',
        borderColorNeg: 'border-red-700'
    },
    // Constant
    1: {
        label: '1',
        width: TILE_SIZE_UNIT,
        height: TILE_SIZE_UNIT,
        colorPos: 'bg-yellow-400',
        colorNeg: 'bg-red-500',
        borderColor: 'border-yellow-600',
        borderColorNeg: 'border-red-700'
    }
};

export const getRotatedType = (currentType: string): string => {
    if (currentType === 'x') return 'x_h';
    if (currentType === 'x_h') return 'x';
    if (currentType === 'y') return 'y_h';
    if (currentType === 'y_h') return 'y';
    if (currentType === 'xy') return 'xy_h';
    if (currentType === 'xy_h') return 'xy';
    return currentType;
};
