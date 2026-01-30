import React from 'react';
import { Zap } from 'lucide-react';

export type ComponentTypeName = 'INPUT' | 'OUTPUT' | 'AND' | 'OR' | 'NOT' | 'XOR';

export interface CircuitNode {
    id: string;
    type: ComponentTypeName;
    x: number;
    y: number;
    label: string;
    state?: boolean;
}

export interface Connection {
    id: string;
    from: string;
    to: string;
    inputIndex: number;
}

export interface DragState {
    id: string;
    startX: number;
    startY: number;
    nodeStartX: number;
    nodeStartY: number;
    /** Start positions of all selected nodes for group drag. Key is node ID. */
    nodeStartPositions?: Record<string, { x: number; y: number }>;
}

export interface WiringState {
    nodeId: string;
    portType: 'output';
}

export interface TruthTableRow {
    inputs: number[];
    outputs: number[];
}

export interface TruthTableData {
    inputs: CircuitNode[];
    outputs: CircuitNode[];
    rows: TruthTableRow[];
}

export type SimulationState = Record<string, boolean>;

export interface ComponentDefinition {
    type: ComponentTypeName;
    label: string;
    inputs: number;
    outputs: number;
    color: string;
    iconColor: string;
    evaluate: (inputs: boolean[], state?: boolean) => boolean;
    render: (active: boolean) => React.ReactNode;
}

export const SNAP_GRID = 20;

const switchClasses = (active: boolean) => {
    if (active) return 'bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.6)]';
    return 'bg-slate-200 dark:bg-slate-700 border-slate-400 dark:border-slate-500';
};

const switchLeverClasses = (active: boolean) => {
    if (active) return 'bg-white border-green-300 -translate-y-0.5';
    return 'bg-slate-300 dark:bg-slate-800 border-slate-400 dark:border-slate-600 translate-y-0.5';
};

const bulbClasses = (active: boolean) => {
    if (active) return 'bg-yellow-300 border-yellow-500 shadow-[0_0_30px_rgba(253,224,71,0.8)] scale-110';
    return 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600';
};

const gateClasses = (lightStroke: string, darkStroke: string) => {
    // Note: lightStroke and darkStroke are expected to be full class names like "stroke-indigo-600"
    // We assume darkStroke is passed as the class that should apply in dark mode.
    // However, the original usage passed just the color name e.g. 'stroke-indigo-400'.
    // We will construct the classes.
    return `fill-white dark:fill-slate-800 stroke-2 ${lightStroke} dark:${darkStroke.replace('stroke-', 'stroke-')}`;
};

export const COMPONENT_TYPES: Record<ComponentTypeName, ComponentDefinition> = {
    INPUT: {
        type: 'INPUT',
        label: 'Switch',
        inputs: 0,
        outputs: 1,
        color: 'bg-amber-500',
        iconColor: 'text-amber-500',
        evaluate: (_inputs: boolean[], state?: boolean) => state ?? false,
        render: (active: boolean) => {
            return React.createElement('div', {
                className: `w-12 h-12 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${switchClasses(active)}`
            }, React.createElement('div', {
                className: `w-4 h-8 rounded-sm border transition-transform ${switchLeverClasses(active)}`
            }));
        }
    },
    OUTPUT: {
        type: 'OUTPUT',
        label: 'Bulb',
        inputs: 1,
        outputs: 0,
        color: 'bg-sky-500',
        iconColor: 'text-sky-500',
        evaluate: (inputs: boolean[]) => inputs[0] || false,
        render: (active: boolean) => {
            const iconClass = active ? 'text-yellow-600' : 'text-slate-400 dark:text-slate-600';
            return React.createElement('div', {
                className: `w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${bulbClasses(active)}`
            }, React.createElement(Zap, { size: 20, className: iconClass, fill: active ? 'currentColor' : 'none' }));
        }
    },
    AND: {
        type: 'AND',
        label: 'AND',
        inputs: 2,
        outputs: 1,
        color: 'bg-indigo-600',
        iconColor: 'text-indigo-500',
        evaluate: (inputs: boolean[]) => inputs[0] && inputs[1],
        render: () => {
            return React.createElement('svg', {
                width: '50', height: '50', viewBox: '0 0 50 50',
                className: gateClasses('stroke-indigo-600', 'stroke-indigo-400')
            }, React.createElement('path', { d: 'M 10 5 L 25 5 C 38 5 38 45 25 45 L 10 45 Z' }));
        }
    },
    OR: {
        type: 'OR',
        label: 'OR',
        inputs: 2,
        outputs: 1,
        color: 'bg-purple-600',
        iconColor: 'text-purple-500',
        evaluate: (inputs: boolean[]) => inputs[0] || inputs[1],
        render: () => {
            return React.createElement('svg', {
                width: '50', height: '50', viewBox: '0 0 50 50',
                className: gateClasses('stroke-purple-600', 'stroke-purple-400')
            }, React.createElement('path', { d: 'M 5 5 C 5 5 15 5 20 5 C 35 5 42 25 42 25 C 42 25 35 45 20 45 C 15 45 5 45 5 45 C 15 25 15 25 5 5 Z' }));
        }
    },
    NOT: {
        type: 'NOT',
        label: 'NOT',
        inputs: 1,
        outputs: 1,
        color: 'bg-rose-600',
        iconColor: 'text-rose-500',
        evaluate: (inputs: boolean[]) => !inputs[0],
        render: () => {
            return React.createElement('svg', {
                width: '50', height: '50', viewBox: '0 0 50 50',
                className: gateClasses('stroke-rose-600', 'stroke-rose-400')
            }, [
                React.createElement('path', { key: 'tri', d: 'M 10 5 L 40 25 L 10 45 Z' }),
                React.createElement('circle', { key: 'circ', cx: '43', cy: '25', r: '3', className: 'fill-white dark:fill-slate-800' })
            ]);
        }
    },
    XOR: {
        type: 'XOR',
        label: 'XOR',
        inputs: 2,
        outputs: 1,
        color: 'bg-cyan-600',
        iconColor: 'text-cyan-500',
        evaluate: (inputs: boolean[]) => (inputs[0] || inputs[1]) && !(inputs[0] && inputs[1]),
        render: () => {
            return React.createElement('svg', {
                width: '50', height: '50', viewBox: '0 0 50 50',
                className: gateClasses('stroke-cyan-600', 'stroke-cyan-400')
            }, [
                React.createElement('path', { key: 'main', d: 'M 10 5 C 10 5 20 5 25 5 C 40 5 47 25 47 25 C 47 25 40 45 25 45 C 20 45 10 45 10 45 C 20 25 20 25 10 5 Z' }),
                React.createElement('path', { key: 'curve', d: 'M 4 5 C 14 25 14 25 4 45', fill: 'none' })
            ]);
        }
    }
};

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const getPortPosition = (nodeType: ComponentTypeName, portType: 'input' | 'output', index: number): { x: number; y: number } => {
    const def = COMPONENT_TYPES[nodeType];
    const width = 60;
    const height = 60;

    if (portType === 'input') {
        const step = height / (def.inputs + 1);
        return { x: -width / 2, y: -height / 2 + step * (index + 1) };
    } else {
        return { x: width / 2, y: 0 };
    }
};

export const getWirePath = (x1: number, y1: number, x2: number, y2: number): string => {
    const dist = Math.abs(x2 - x1) * 0.5;
    return `M ${x1} ${y1} C ${x1 + dist} ${y1}, ${x2 - dist} ${y2}, ${x2} ${y2}`;
};

export const DEFAULT_NODES: CircuitNode[] = [
    { id: 'start_1', type: 'INPUT', x: 100, y: 100, label: 'A', state: false },
    { id: 'start_2', type: 'INPUT', x: 100, y: 250, label: 'B', state: false },
    { id: 'gate_1', type: 'AND', x: 300, y: 175, label: 'AND' },
    { id: 'out_1', type: 'OUTPUT', x: 500, y: 175, label: 'Out' },
];

export const DEFAULT_CONNECTIONS: Connection[] = [
    { id: 'c1', from: 'start_1', to: 'gate_1', inputIndex: 0 },
    { id: 'c2', from: 'start_2', to: 'gate_1', inputIndex: 1 },
    { id: 'c3', from: 'gate_1', to: 'out_1', inputIndex: 0 },
];
