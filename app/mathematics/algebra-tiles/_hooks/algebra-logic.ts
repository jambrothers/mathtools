import { TileData } from "./use-algebra-tiles"
import { TILE_TYPES } from "../constants"
import { Position } from "@/types/manipulatives"

export function groupTilesLogic(tiles: TileData[], startX: number = 50, startY: number = 50, maxWidth: number = 300): TileData[] {
    const spacing = 10;

    // Sort logic
    const typeOrder: Record<string, number> = {
        'x2': 0, 'y2': 10,
        'xy': 20, 'xy_h': 21,
        'x': 30, 'x_h': 31,
        'y': 40, 'y_h': 41,
        '1': 50
    };

    const sorted = [...tiles].sort((a, b) => {
        if (typeOrder[a.type] !== typeOrder[b.type]) {
            return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
        }
        return b.value - a.value;
    });

    let currentX = startX;
    let currentY = startY;
    let lastType: string | null = null;
    let maxRowHeight = 0;

    return sorted.map(tile => {
        const def = TILE_TYPES[tile.type] || TILE_TYPES['1'];

        // Start new row if type changes
        // Using "base type" check via string includes might be safer if we had variants
        // But here types are strict strings.
        // Let's assume strict grouping by exact type for now, or improvements later.
        if (lastType && lastType !== tile.type) {
            currentX = startX;
            currentY += (maxRowHeight || def.height) + spacing;
            maxRowHeight = 0;
        }

        // Wrap if too wide
        if (currentX > startX + maxWidth) {
            currentX = startX;
            currentY += (maxRowHeight || def.height) + spacing;
            maxRowHeight = 0;
        }

        const newTile = {
            ...tile,
            x: currentX,
            y: currentY
        };

        maxRowHeight = Math.max(maxRowHeight, def.height);
        currentX += def.width + spacing;
        lastType = tile.type;

        return newTile;
    });
}


// --- Helper Functions from original implementation ---

export const parseExpression = (expr: string): TileTerms => {
    let cleanExpr = expr.replace(/\s+/g, '').replace(/--/g, '+').replace(/\+\+/g, '+').replace(/\+-/g, '-').replace(/-\+/g, '-');
    const termRegex = /([+-]?\d*)(x\^2|y\^2|xy|yx|x|y)?/g;
    const terms: TileTerms = { x2: [], y2: [], xy: [], x: [], y: [], 1: [] };

    let match;
    while ((match = termRegex.exec(cleanExpr)) !== null) {
        if (match.index === termRegex.lastIndex) termRegex.lastIndex++;
        if (!match[0]) continue;

        let coeffStr = match[1];
        let typeStr = match[2];

        let coeff = 1;
        if (coeffStr === '-' || coeffStr === '+-') coeff = -1;
        else if (coeffStr === '+' || coeffStr === '') coeff = 1;
        else coeff = parseInt(coeffStr, 10);

        if (isNaN(coeff)) coeff = 1;

        let targetType = '1';
        if (typeStr === 'x^2') targetType = 'x2';
        else if (typeStr === 'y^2') targetType = 'y2';
        else if (typeStr === 'xy' || typeStr === 'yx') targetType = 'xy';
        else if (typeStr === 'x') targetType = 'x';
        else if (typeStr === 'y') targetType = 'y';
        else if (!typeStr && !coeffStr) continue;

        const count = Math.abs(coeff);
        const value = Math.sign(coeff);

        if (terms[targetType]) {
            for (let i = 0; i < count; i++) {
                terms[targetType].push(value);
            }
        }
    }
    return terms;
};

type TileTerms = {
    x2: number[];
    y2: number[];
    xy: number[];
    x: number[];
    y: number[];
    '1': number[];
    [key: string]: number[]; // Index signature
};

export function getBaseType(type: string): string {
    if (type === 'x_h') return 'x';
    if (type === 'y_h') return 'y';
    if (type === 'xy_h') return 'xy';
    return type;
}

export const getRotatedType = (currentType: string): string => {
    if (currentType === 'x') return 'x_h';
    if (currentType === 'x_h') return 'x';
    if (currentType === 'y') return 'y_h';
    if (currentType === 'y_h') return 'y';
    if (currentType === 'xy') return 'xy_h';
    if (currentType === 'xy_h') return 'xy';
    return currentType; // No rotation for squares
};


export function simplifyTilesLogic(tiles: TileData[]): TileData[] {
    let newTiles = [...tiles];
    let changed = true;

    while (changed) {
        changed = false;
        const toRemove = new Set<number>();

        for (let i = 0; i < newTiles.length; i++) {
            if (toRemove.has(i)) continue;

            for (let j = i + 1; j < newTiles.length; j++) {
                if (toRemove.has(j)) continue;

                const t1 = newTiles[i];
                const t2 = newTiles[j];

                const type1 = getBaseType(t1.type);
                const type2 = getBaseType(t2.type);

                // If same type and opposite values, they cancel out
                if (type1 === type2 && t1.value === -t2.value) {
                    toRemove.add(i);
                    toRemove.add(j);
                    changed = true;
                    break;
                }
            }
            if (changed) break;
        }

        if (changed) {
            newTiles = newTiles.filter((_, idx) => !toRemove.has(idx));
        }
    }

    return newTiles;
}
