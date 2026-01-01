"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Calculator, Eraser, Check, Grid, Undo, Magnet, Settings2, Eye, EyeOff, MousePointer2 } from 'lucide-react';

/**
 * Algebra Tiles Tool
 * * A virtual manipulative for learning algebra.
 * - Supports x^2, x, y^2, y, xy and 1 tiles.
 * - Supports positive and negative values.
 * - Drag and drop interface with Marquee Selection.
 * - Equation parser to auto-populate tiles.
 * - Zero pair cancellation logic.
 * - Grouping logic to organize like terms.
 * - Undo functionality (last 10 states).
 * - Triple-click to rotate rectangular tiles.
 * - Keyboard Shortcuts: Delete, Ctrl+Z, R (Rotate), F (Flip).
 */

// --- Constants & Config ---
const TILE_SIZE_UNIT = 50; // Base dimension for '1' block
const TILE_X_LENGTH = 120; // Length of 'x' block
const TILE_Y_LENGTH = 90;  // Length of 'y' block
const SNAP_SIZE = 10; // Grid snap interval in pixels

// --- Interfaces ---

interface TileTypeDefinition {
    label: string;
    width: number;
    height: number;
    colorPos: string;
    colorNeg: string;
    borderColor: string;
    borderColorNeg: string;
}

interface Tile {
    id: string;
    type: string;
    value: number;
    x: number;
    y: number;
    side: 'left' | 'right';
}

interface HistoryState {
    tiles: Tile[];
    mode: string;
}

interface DragInfo {
    startX: number;
    startY: number;
    initialPositions: Record<string, { x: number; y: number }>;
}

interface MarqueeBox {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    originClientX: number;
    originClientY: number;
}

type TileTerms = {
    x2: number[];
    y2: number[];
    xy: number[];
    x: number[];
    y: number[];
    '1': number[];
    [key: string]: number[]; // Index signature for dynamic access
};

// Tile Definitions
const TILE_TYPES: Record<string, TileTypeDefinition> = {
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

const INITIAL_TILES: Tile[] = [];

// --- Helper Functions ---

const parseExpression = (expr: string): TileTerms => {
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

const getBaseType = (type: string): string => {
    if (type === 'x_h') return 'x';
    if (type === 'y_h') return 'y';
    if (type === 'xy_h') return 'xy';
    return type;
};

// Pure function to determine rotated type
const getRotatedType = (currentType: string): string => {
    if (currentType === 'x') return 'x_h';
    if (currentType === 'x_h') return 'x';
    if (currentType === 'y') return 'y_h';
    if (currentType === 'y_h') return 'y';
    if (currentType === 'xy') return 'xy_h';
    if (currentType === 'xy_h') return 'xy';
    return currentType; // No rotation for squares
};

// --- Main Component ---

export default function AlgebraTiles() {
    const [tiles, setTiles] = useState<Tile[]>(INITIAL_TILES);
    const [equationInput, setEquationInput] = useState<string>('');
    const [mode, setMode] = useState<string>('expression');
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
    const [showY, setShowY] = useState<boolean>(false);
    const [showLabels, setShowLabels] = useState<boolean>(true);
    const [scale, setScale] = useState<number>(1);

    // Selection & Drag State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
    const [marqueeBox, setMarqueeBox] = useState<MarqueeBox | null>(null);

    const workspaceRef = useRef<HTMLDivElement>(null);
    const trashRef = useRef<HTMLDivElement>(null);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    // --- History Management ---

    const saveHistory = () => {
        setHistory(prev => {
            if (prev.length > 0) {
                const lastState = prev[prev.length - 1];
                if (JSON.stringify(lastState.tiles) === JSON.stringify(tiles) && lastState.mode === mode) {
                    return prev;
                }
            }
            const newHistory = [...prev, { tiles: [...tiles], mode }];
            if (newHistory.length > 10) return newHistory.slice(newHistory.length - 10);
            return newHistory;
        });
    };

    const undo = () => {
        if (history.length === 0) return;
        const lastState = history[history.length - 1];
        setTiles(lastState.tiles);
        setMode(lastState.mode);
        setHistory(prev => prev.slice(0, -1));
    };

    // --- Keyboard Shortcuts ---

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input
            if (e.target instanceof HTMLInputElement) return;

            // Undo: Ctrl+Z or Cmd+Z
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                undo();
                return;
            }

            // Delete: Backspace or Delete
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedIds.size > 0) {
                    e.preventDefault();
                    saveHistory();
                    removeTiles(Array.from(selectedIds));
                }
                return;
            }

            // Rotate: R
            if (e.key === 'r' || e.key === 'R') {
                if (selectedIds.size > 0) {
                    e.preventDefault();
                    saveHistory();
                    setTiles(prev => prev.map(t => {
                        if (selectedIds.has(t.id)) {
                            return { ...t, type: getRotatedType(t.type) };
                        }
                        return t;
                    }));
                }
                return;
            }

            // Flip: F
            if (e.key === 'f' || e.key === 'F') {
                if (selectedIds.size > 0) {
                    e.preventDefault();
                    saveHistory();
                    setTiles(prev => prev.map(t => {
                        if (selectedIds.has(t.id)) {
                            return { ...t, value: t.value * -1 };
                        }
                        return t;
                    }));
                }
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, tiles, history, mode]); // Dependencies crucial for closure state


    // --- Tile Management ---

    const addTile = (type: string, value: number, side: 'left' | 'right' = 'left') => {
        saveHistory();
        const workspaceRect = workspaceRef.current?.getBoundingClientRect();
        const offset = tiles.length * 10;
        let startX = 50 + offset;
        let startY = 50 + offset;

        if (mode === 'equation' && side === 'right') {
            startX = (workspaceRect ? workspaceRect.width / 2 : 400) + 50 + offset;
        }

        if (snapToGrid) {
            startX = Math.round(startX / SNAP_SIZE) * SNAP_SIZE;
            startY = Math.round(startY / SNAP_SIZE) * SNAP_SIZE;
        }

        const newTile = {
            id: generateId(),
            type,
            value,
            x: startX,
            y: startY,
            side
        };
        setTiles(prev => [...prev, newTile]);
        setSelectedIds(new Set([newTile.id]));
    };

    const clearTiles = () => {
        saveHistory();
        setTiles([]);
        setSelectedIds(new Set());
    };

    const flipTile = (id: string) => {
        saveHistory();
        setTiles(prev => prev.map(t =>
            t.id === id ? { ...t, value: t.value * -1 } : t
        ));
    };

    // Mouse-based rotate (needs value flip fix for double-click side effect)
    const rotateTileMouse = (id: string) => {
        saveHistory();
        setTiles(prev => prev.map(t => {
            if (t.id !== id) return t;
            const newType = getRotatedType(t.type);
            const newValue = t.value * -1; // Counter-act double click sign flip
            return { ...t, type: newType, value: newValue };
        }));
    };

    const removeTiles = (idsToRemove: string[]) => {
        const idSet = new Set(idsToRemove);
        setTiles(prev => prev.filter(t => !idSet.has(t.id)));
        setSelectedIds(prev => {
            const next = new Set(prev);
            idsToRemove.forEach(id => next.delete(id));
            return next;
        });
    };

    // --- Interaction Logic (Drag & Select) ---

    const handleTileMouseDown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        saveHistory();

        const shiftKey = e.shiftKey || e.metaKey;
        let newSelectedIds = new Set(selectedIds);

        if (!selectedIds.has(id)) {
            if (!shiftKey) {
                newSelectedIds = new Set([id]);
            } else {
                newSelectedIds.add(id);
            }
            setSelectedIds(newSelectedIds);
        }

        const initialPositions: Record<string, { x: number; y: number }> = {};
        tiles.forEach(t => {
            if (newSelectedIds.has(t.id)) {
                initialPositions[t.id] = { x: t.x, y: t.y };
            }
        });

        setDragInfo({
            startX: e.clientX,
            startY: e.clientY,
            initialPositions
        });
    };

    const handleWorkspaceMouseDown = (e: React.MouseEvent) => {
        if (!e.shiftKey && !e.metaKey) {
            setSelectedIds(new Set());
        }

        const rect = workspaceRef.current!.getBoundingClientRect();
        setMarqueeBox({
            startX: e.clientX - rect.left,
            startY: e.clientY - rect.top,
            currentX: e.clientX - rect.left,
            currentY: e.clientY - rect.top,
            originClientX: e.clientX,
            originClientY: e.clientY
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (dragInfo) {
            const dx = (e.clientX - dragInfo.startX) / scale;
            const dy = (e.clientY - dragInfo.startY) / scale;

            setTiles(prev => prev.map(t => {
                if (dragInfo.initialPositions[t.id]) {
                    const init = dragInfo.initialPositions[t.id];
                    let newX = init.x + dx;
                    let newY = init.y + dy;

                    if (snapToGrid) {
                        newX = Math.round(newX / SNAP_SIZE) * SNAP_SIZE;
                        newY = Math.round(newY / SNAP_SIZE) * SNAP_SIZE;
                    }
                    return { ...t, x: newX, y: newY };
                }
                return t;
            }));
            return;
        }

        if (marqueeBox && workspaceRef.current) {
            const rect = workspaceRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            setMarqueeBox(prev => prev ? ({
                ...prev,
                currentX: mouseX,
                currentY: mouseY
            }) : null);

            const minX = Math.min(marqueeBox.startX, mouseX);
            const maxX = Math.max(marqueeBox.startX, mouseX);
            const minY = Math.min(marqueeBox.startY, mouseY);
            const maxY = Math.max(marqueeBox.startY, mouseY);

            const newSelection = new Set(e.shiftKey ? selectedIds : []);

            tiles.forEach(t => {
                const def = TILE_TYPES[t.type];
                const tLeft = t.x;
                const tRight = t.x + def.width;
                const tTop = t.y;
                const tBottom = t.y + def.height;

                const isOverlapping = (
                    tLeft < maxX &&
                    tRight > minX &&
                    tTop < maxY &&
                    tBottom > minY
                );

                if (isOverlapping) {
                    newSelection.add(t.id);
                }
            });
            setSelectedIds(newSelection);
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (dragInfo) {
            if (trashRef.current) {
                const trashRect = trashRef.current.getBoundingClientRect();
                if (
                    e.clientX >= trashRect.left &&
                    e.clientX <= trashRect.right &&
                    e.clientY >= trashRect.top &&
                    e.clientY <= trashRect.bottom
                ) {
                    removeTiles(Object.keys(dragInfo.initialPositions));
                }
            }
            setDragInfo(null);
        }
        if (marqueeBox) {
            setMarqueeBox(null);
        }
    };

    useEffect(() => {
        if (dragInfo || marqueeBox) {
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('mousemove', handleMouseMove);
        }
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [dragInfo, marqueeBox]);

    // --- Logic for Equation/Group/Simplify ---

    const visualizeEquation = () => {
        if (!equationInput.trim()) return;
        saveHistory();
        const parts = equationInput.split('=');
        const isEq = parts.length > 1;
        setMode(isEq ? 'equation' : 'expression');
        const emptyTerms: TileTerms = { x2: [], y2: [], xy: [], x: [], y: [], 1: [] };
        const leftTerms = parseExpression(parts[0]);
        const rightTerms = isEq ? parseExpression(parts[1]) : { ...emptyTerms };

        if (leftTerms.y.length > 0 || leftTerms.y2.length > 0 || leftTerms.xy.length > 0 ||
            rightTerms.y.length > 0 || rightTerms.y2.length > 0 || rightTerms.xy.length > 0) {
            setShowY(true);
        }

        const newTiles: Tile[] = [];
        const generateForSide = (terms: TileTerms, side: 'left' | 'right', baseX: number) => {
            let currentY = 60;
            let currentX = baseX;
            const spacing = 10;
            ['x2', 'y2', 'xy', 'x', 'y', '1'].forEach(type => {
                const values = terms[type];
                if (!values || values.length === 0) return;
                const dim = TILE_TYPES[type];
                values.forEach((val, i) => {
                    newTiles.push({
                        id: generateId() + `_${side}_${type}_${i}`,
                        type,
                        value: val,
                        x: currentX,
                        y: currentY,
                        side
                    });
                    currentX += dim.width + spacing;
                    if (currentX > baseX + 300) {
                        currentX = baseX;
                        currentY += dim.height + spacing;
                    }
                });
                if (currentX !== baseX) {
                    currentX = baseX;
                    currentY += dim.height + spacing;
                }
            });
        };
        const wsWidth = workspaceRef.current ? workspaceRef.current.clientWidth : 800;
        generateForSide(leftTerms, 'left', isEq ? 50 : 50);
        if (isEq) generateForSide(rightTerms, 'right', wsWidth / 2 + 50);

        setTiles(newTiles);
        setSelectedIds(new Set());
    };

    const groupTiles = () => {
        saveHistory();
        const wsWidth = workspaceRef.current ? workspaceRef.current.clientWidth : 800;
        const splitX = wsWidth / 2;
        const spacing = 10;
        const startY = 60;

        const layoutSubset = (subset: Tile[], baseX: number) => {
            const typeOrder: Record<string, number> = {
                'x2': 0, 'y2': 10,
                'xy': 20, 'xy_h': 21,
                'x': 30, 'x_h': 31,
                'y': 40, 'y_h': 41,
                '1': 50
            };
            const sorted = [...subset].sort((a, b) => {
                if (typeOrder[a.type] !== typeOrder[b.type]) {
                    return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
                }
                return b.value - a.value;
            });
            let currentX = baseX;
            let currentY = startY;
            let lastType: string | null = null;
            let maxRowHeight = 0;
            return sorted.map(tile => {
                const dim = TILE_TYPES[tile.type];
                if (lastType && getBaseType(lastType) !== getBaseType(tile.type)) {
                    currentX = baseX;
                    currentY += (maxRowHeight || dim.height) + spacing;
                    maxRowHeight = 0;
                }
                if (currentX > baseX + 300) {
                    currentX = baseX;
                    currentY += (maxRowHeight || dim.height) + spacing;
                    maxRowHeight = 0;
                }
                const newTile: Tile = {
                    ...tile,
                    x: currentX,
                    y: currentY,
                    side: mode === 'equation' ? (baseX < splitX ? 'left' : 'right') : 'left'
                };
                maxRowHeight = Math.max(maxRowHeight, dim.height);
                currentX += dim.width + spacing;
                lastType = tile.type;
                return newTile;
            });
        };
        const leftTiles: Tile[] = [];
        const rightTiles: Tile[] = [];
        tiles.forEach(t => {
            if (mode === 'equation') {
                if (t.x < splitX) leftTiles.push(t);
                else rightTiles.push(t);
            } else {
                leftTiles.push(t);
            }
        });
        setTiles([...layoutSubset(leftTiles, 50), ...(mode === 'equation' ? layoutSubset(rightTiles, splitX + 50) : [])]);
    };

    const simplifyTiles = () => {
        saveHistory();
        let newTiles: Tile[] = [...tiles];
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
                    const wsWidth = workspaceRef.current?.clientWidth || 800;
                    const splitX = wsWidth / 2;
                    const t1Side = mode === 'expression' ? 'left' : (t1.x < splitX ? 'left' : 'right');
                    const t2Side = mode === 'expression' ? 'left' : (t2.x < splitX ? 'left' : 'right');
                    const type1 = getBaseType(t1.type);
                    const type2 = getBaseType(t2.type);
                    if (type1 === type2 && t1.value === -t2.value && t1Side === t2Side) {
                        toRemove.add(i);
                        toRemove.add(j);
                        changed = true;
                        break;
                    }
                }
                if (changed) break;
            }
            if (changed) newTiles = newTiles.filter((_, idx) => !toRemove.has(idx));
        }
        setTiles(newTiles);
        setSelectedIds(new Set(Array.from(selectedIds).filter(id => newTiles.find(t => t.id === id))));
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 text-slate-900 font-sans overflow-hidden">

            {/* Header & Controls */}
            <div className="p-4 bg-white shadow-sm border-b border-slate-200 z-10 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white">
                        <Calculator size={24} />
                    </div>
                    {/* <h1 className="text-xl font-bold text-slate-800">Algebra Tiles</h1> */}
                </div>

                {/* Input Area */}
                <div className="flex-1 max-w-2xl w-full flex gap-2">
                    <input
                        type="text"
                        placeholder="Expression or Equation (e.g. 2x + 1 = 5, xy + y^2...)"
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={equationInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEquationInput(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && visualizeEquation()}
                    />
                    <button
                        onClick={visualizeEquation}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                        Visualize
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap justify-center md:justify-end">
                    <button
                        onClick={() => setShowLabels(!showLabels)}
                        className={`px-3 py-2 ${!showLabels ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600'} hover:bg-slate-200 border border-transparent text-sm font-medium rounded-lg transition-all flex items-center gap-1`}
                        title="Show/Hide Labels"
                    >
                        {showLabels ? <Eye size={16} /> : <EyeOff size={16} />}
                        <span className="hidden sm:inline">Labels</span>
                    </button>
                    <button
                        onClick={() => setShowY(!showY)}
                        className={`px-3 py-2 ${showY ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-slate-100 text-slate-600'} hover:bg-slate-200 border border-transparent text-sm font-medium rounded-lg transition-all flex items-center gap-1`}
                        title="Toggle Y Variables"
                    >
                        <Settings2 size={16} /> {showY ? 'Hide Y' : 'Show Y'}
                    </button>
                    <button
                        onClick={() => setSnapToGrid(!snapToGrid)}
                        className={`px-3 py-2 ${snapToGrid ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600'} hover:bg-slate-200 border border-transparent text-sm font-medium rounded-lg transition-all flex items-center gap-1`}
                        title="Toggle Snap to Grid"
                    >
                        <Magnet size={16} /> Snap
                    </button>
                    <button
                        onClick={undo}
                        disabled={history.length === 0}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-50 text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                        title="Undo last action (Ctrl+Z)"
                    >
                        <Undo size={16} /> Undo
                    </button>
                    <button
                        onClick={groupTiles}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                        title="Group Like Terms"
                    >
                        <Grid size={16} /> Group
                    </button>
                    <button
                        onClick={simplifyTiles}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                        title="Remove Zero Pairs"
                    >
                        <Check size={16} /> Simplify
                    </button>
                    <button
                        onClick={clearTiles}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                        title="Clear all tiles"
                    >
                        <Eraser size={16} /> Clear
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">

                {/* Sidebar */}
                <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-6 shadow-sm overflow-y-auto z-10 shrink-0">

                    <div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Add Positive</h3>
                        <div className="flex flex-col gap-3 items-start">
                            <button onClick={() => addTile('x2', 1)} className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-md w-full transition-colors group">
                                <div className={`w-8 h-8 ${TILE_TYPES.x2.colorPos} border-2 ${TILE_TYPES.x2.borderColor} rounded-sm shadow-sm`}></div>
                                <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">+x²</span>
                            </button>
                            <button onClick={() => addTile('x', 1)} className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-md w-full transition-colors group">
                                <div className={`w-3 h-8 ${TILE_TYPES.x.colorPos} border-2 ${TILE_TYPES.x.borderColor} rounded-sm shadow-sm`}></div>
                                <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">+x</span>
                            </button>

                            {showY && (
                                <>
                                    <button onClick={() => addTile('y2', 1)} className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-md w-full transition-colors group">
                                        <div className={`w-6 h-6 ${TILE_TYPES.y2.colorPos} border-2 ${TILE_TYPES.y2.borderColor} rounded-sm shadow-sm`}></div>
                                        <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">+y²</span>
                                    </button>
                                    <button onClick={() => addTile('y', 1)} className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-md w-full transition-colors group">
                                        <div className={`w-3 h-6 ${TILE_TYPES.y.colorPos} border-2 ${TILE_TYPES.y.borderColor} rounded-sm shadow-sm`}></div>
                                        <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">+y</span>
                                    </button>
                                    <button onClick={() => addTile('xy', 1)} className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-md w-full transition-colors group">
                                        <div className={`w-8 h-6 ${TILE_TYPES.xy.colorPos} border-2 ${TILE_TYPES.xy.borderColor} rounded-sm shadow-sm`}></div>
                                        <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">+xy</span>
                                    </button>
                                </>
                            )}

                            <button onClick={() => addTile('1', 1)} className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-md w-full transition-colors group">
                                <div className={`w-4 h-4 ${TILE_TYPES[1].colorPos} border-2 ${TILE_TYPES[1].borderColor} rounded-sm shadow-sm`}></div>
                                <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">+1</span>
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Add Negative</h3>
                        <div className="flex flex-col gap-3 items-start">
                            <button onClick={() => addTile('x2', -1)} className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-md w-full transition-colors group">
                                <div className={`w-8 h-8 ${TILE_TYPES.x2.colorNeg} border-2 ${TILE_TYPES.x2.borderColorNeg} rounded-sm shadow-sm`}></div>
                                <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">-x²</span>
                            </button>
                            <button onClick={() => addTile('x', -1)} className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-md w-full transition-colors group">
                                <div className={`w-3 h-8 ${TILE_TYPES.x.colorNeg} border-2 ${TILE_TYPES.x.borderColorNeg} rounded-sm shadow-sm`}></div>
                                <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">-x</span>
                            </button>

                            {showY && (
                                <>
                                    <button onClick={() => addTile('y2', -1)} className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-md w-full transition-colors group">
                                        <div className={`w-6 h-6 ${TILE_TYPES.y2.colorNeg} border-2 ${TILE_TYPES.y2.borderColorNeg} rounded-sm shadow-sm`}></div>
                                        <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">-y²</span>
                                    </button>
                                    <button onClick={() => addTile('y', -1)} className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-md w-full transition-colors group">
                                        <div className={`w-3 h-6 ${TILE_TYPES.y.colorNeg} border-2 ${TILE_TYPES.y.borderColorNeg} rounded-sm shadow-sm`}></div>
                                        <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">-y</span>
                                    </button>
                                    <button onClick={() => addTile('xy', -1)} className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-md w-full transition-colors group">
                                        <div className={`w-8 h-6 ${TILE_TYPES.xy.colorNeg} border-2 ${TILE_TYPES.xy.borderColorNeg} rounded-sm shadow-sm`}></div>
                                        <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">-xy</span>
                                    </button>
                                </>
                            )}

                            <button onClick={() => addTile('1', -1)} className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-md w-full transition-colors group">
                                <div className={`w-4 h-4 ${TILE_TYPES[1].colorNeg} border-2 ${TILE_TYPES[1].borderColorNeg} rounded-sm shadow-sm`}></div>
                                <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">-1</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 text-xs text-slate-400">
                        <p className="mb-2"><span className="font-bold text-slate-600">Shortcuts:</span></p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>Drag</strong> background to select multiple.</li>
                            <li><strong>Delete/Bksp</strong> removes selection.</li>
                            <li><strong>R</strong> rotates selection.</li>
                            <li><strong>F</strong> flips sign of selection.</li>
                            <li><strong>Ctrl+Z</strong> undo.</li>
                        </ul>
                    </div>
                </div>

                {/* Workspace Canvas */}
                <div
                    ref={workspaceRef}
                    className="flex-1 bg-slate-50 relative overflow-hidden"
                    style={{ cursor: marqueeBox ? 'crosshair' : 'default' }}
                    onMouseDown={handleWorkspaceMouseDown}
                >
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}>
                    </div>

                    {/* Equation Split Line */}
                    {mode === 'equation' && (
                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 border-l-2 border-dashed border-slate-300 flex justify-center pointer-events-none">
                            <div className="bg-white px-2 py-1 mt-4 text-slate-400 font-bold text-xl h-min rounded shadow-sm border border-slate-200">=</div>
                        </div>
                    )}

                    {/* Expression Mode Center Guide */}
                    {mode === 'expression' && tiles.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-slate-300 font-medium text-lg">Workspace Empty</div>
                        </div>
                    )}

                    {/* Marquee Box */}
                    {marqueeBox && (
                        <div
                            className="absolute bg-blue-500/10 border border-blue-500/50 pointer-events-none z-50"
                            style={{
                                left: Math.min(marqueeBox.startX, marqueeBox.currentX),
                                top: Math.min(marqueeBox.startY, marqueeBox.currentY),
                                width: Math.abs(marqueeBox.currentX - marqueeBox.startX),
                                height: Math.abs(marqueeBox.currentY - marqueeBox.startY)
                            }}
                        />
                    )}

                    {/* Render Tiles */}
                    {tiles.map((tile) => {
                        const def = TILE_TYPES[tile.type];
                        const isNegative = tile.value === -1;
                        const bgColor = isNegative ? def.colorNeg : def.colorPos;
                        const borderColor = isNegative ? def.borderColorNeg : def.borderColor;
                        const isSelected = selectedIds.has(tile.id);

                        return (
                            <div
                                key={tile.id}
                                onMouseDown={(e) => handleTileMouseDown(e, tile.id)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (e.detail === 3) rotateTileMouse(tile.id);
                                }}
                                onDoubleClick={() => flipTile(tile.id)}
                                className={`absolute ${bgColor} border-2 shadow-md flex items-center justify-center cursor-move select-none transition-transform active:z-50`}
                                style={{
                                    width: def.width,
                                    height: def.height,
                                    left: tile.x,
                                    top: tile.y,
                                    zIndex: isSelected || dragInfo?.initialPositions[tile.id] ? 50 : 10,
                                    transform: 'translate(0,0)',
                                    borderColor: isSelected ? '#3b82f6' : borderColor.replace('border-', ''), // Use blue for selected or default border color
                                    boxShadow: isSelected ? '0 0 0 2px #3b82f6, 0 4px 6px -1px rgb(0 0 0 / 0.1)' : ''
                                }}
                            >
                                {/* Label */}
                                {showLabels && (
                                    <span className={`font-bold text-white/90 ${tile.type === '1' ? 'text-sm' : 'text-lg'}`}>
                                        {isNegative ? '-' : ''}{def.label}
                                    </span>
                                )}
                            </div>
                        );
                    })}

                    {/* Trash Zone */}
                    <div
                        ref={trashRef}
                        className="absolute bottom-6 right-6 z-20"
                    >
                        <div
                            className={`
                    w-16 h-16 rounded-full flex items-center justify-center 
                    transition-all duration-200 border-2
                    ${dragInfo ? 'bg-red-50 border-red-200 text-red-500 scale-110 shadow-lg' : 'bg-white border-slate-200 text-slate-300 shadow-sm'}
                `}
                        >
                            <Trash2 size={24} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}