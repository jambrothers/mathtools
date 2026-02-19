import { useState, useCallback, useMemo } from 'react';
import {
    Viewport,
    zoomViewport,
    clampViewport,
    snapToTick,
    formatJumpLabel,
    panViewport
} from '../_lib/number-line';
import {
    PointMarker,
    JumpArc,
    NumberLineState
} from '../_lib/url-state';
import {
    DEFAULT_VIEWPORT,
    ZOOM_FACTOR,
    POINT_COLORS,
    MAX_POINTS
} from '../constants';

export type InteractionMode = 'default' | 'add-arc' | 'add-point' | 'delete-point';

export function useNumberLine() {
    const [min, setMin] = useState(DEFAULT_VIEWPORT.min);
    const [max, setMax] = useState(DEFAULT_VIEWPORT.max);
    const [points, setPoints] = useState<PointMarker[]>([]);
    const [arcs, setArcs] = useState<JumpArc[]>([]);
    const [showLabels, setShowLabels] = useState(true);
    const [hideValues, setHideValues] = useState(false);
    const [snapToTicks, setSnapToTicks] = useState(true);

    const [interactionMode, setInteractionMode] = useState<InteractionMode>('default');
    const [pendingArcStart, setPendingArcStart] = useState<string | null>(null);

    // Memoize viewport to prevent unnecessary re-renders and stabilize hook dependencies
    const viewport = useMemo<Viewport>(() => ({ min, max }), [min, max]);

    // Viewport Actions
    const setRange = useCallback((newMin: number, newMax: number) => {
        const clamped = clampViewport({ min: newMin, max: newMax });
        setMin(clamped.min);
        setMax(clamped.max);
    }, []);

    const zoom = useCallback((factor: number, focalPoint?: number) => {
        const next = zoomViewport(viewport, factor, focalPoint);
        setMin(next.min);
        setMax(next.max);
    }, [viewport]);

    const zoomIn = useCallback(() => {
        zoom(1 / ZOOM_FACTOR);
    }, [zoom]);

    const zoomOut = useCallback(() => {
        zoom(ZOOM_FACTOR);
    }, [zoom]);

    const pan = useCallback((delta: number) => {
        const next = panViewport(viewport, delta);
        setMin(next.min);
        setMax(next.max);
    }, [viewport]);

    const applyPreset = useCallback((newMin: number, newMax: number) => {
        setRange(newMin, newMax);
    }, [setRange]);

    const reset = useCallback(() => {
        setMin(DEFAULT_VIEWPORT.min);
        setMax(DEFAULT_VIEWPORT.max);
        setPoints([]);
        setArcs([]);
        setShowLabels(true);
        setHideValues(false);
        setSnapToTicks(true);
        setInteractionMode('default');
        setPendingArcStart(null);
    }, []);

    // Arc Actions
    const addArc = useCallback((fromId: string, toId: string, label?: string) => {
        let arcLabel = label;

        if (!arcLabel) {
            const fromP = points.find(p => p.id === fromId);
            const toP = points.find(p => p.id === toId);
            if (fromP && toP) {
                arcLabel = formatJumpLabel(fromP.value, toP.value);
            }
        }

        const newArc: JumpArc = { fromId, toId, label: arcLabel };
        setArcs(prev => [...prev, newArc]);
    }, [points]);

    const removeArc = useCallback((index: number) => {
        setArcs(prev => prev.filter((_, i) => i !== index));
    }, []);

    // Point Actions
    const addPoint = useCallback((value: number, label?: string) => {
        if (points.length >= MAX_POINTS) return;

        const id = `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const snappedValue = snapToTicks ? snapToTick(value, viewport) : value;

        setPoints(prev => {
            if (prev.length >= MAX_POINTS) return prev;

            // Auto-assign letter label if none provided
            let finalLabel = label;
            if (!finalLabel) {
                const letter = String.fromCharCode(65 + (prev.length % 26)); // A, B, C...
                finalLabel = letter;
            }

            const newPoint: PointMarker = {
                id,
                value: snappedValue,
                label: finalLabel,
                color: POINT_COLORS[prev.length % POINT_COLORS.length]
            };
            return [...prev, newPoint];
        });
        return id;
    }, [snapToTicks, viewport, points.length]);

    const removePoint = useCallback((id: string) => {
        setPoints(prev => prev.filter(p => p.id !== id));
        // Also remove arcs connected to this point
        setArcs(prev => prev.filter(a => a.fromId !== id && a.toId !== id));
        if (pendingArcStart === id) setPendingArcStart(null);
    }, [pendingArcStart]);

    const movePoint = useCallback((id: string, newValue: number) => {
        setPoints(prev => prev.map(p =>
            p.id === id
                ? { ...p, value: snapToTicks ? snapToTick(newValue, viewport) : newValue }
                : p
        ));
    }, [snapToTicks, viewport]);

    const togglePointHidden = useCallback((id: string) => {
        setPoints(prev => prev.map(p =>
            p.id === id ? { ...p, hidden: !p.hidden } : p
        ));
    }, []);

    const revealAllPoints = useCallback(() => {
        setPoints(prev => prev.map(p => ({ ...p, hidden: false })));
    }, []);

    const hideAllPoints = useCallback(() => {
        setPoints(prev => prev.map(p => ({ ...p, hidden: true })));
    }, []);

    const handleLineClick = useCallback((value: number) => {
        if (interactionMode !== 'add-point') return;
        addPoint(value);
    }, [interactionMode, addPoint]);

    const handlePointClick = useCallback((id: string) => {
        if (interactionMode === 'delete-point') {
            removePoint(id);
            return;
        }

        if (interactionMode !== 'add-arc') return;

        if (pendingArcStart === null) {
            setPendingArcStart(id);
        } else if (pendingArcStart === id) {
            // Deselect if clicking same point
            setPendingArcStart(null);
        } else {
            // Connect points
            addArc(pendingArcStart, id);
            setPendingArcStart(null);
        }
    }, [interactionMode, pendingArcStart, addArc, removePoint]);

    // Initialization
    const initFromState = useCallback((state: NumberLineState) => {
        setMin(state.min);
        setMax(state.max);
        setPoints(state.points);
        setArcs(state.arcs);
        setShowLabels(state.showLabels);
        setHideValues(state.hideValues);
        setSnapToTicks(state.snapToTicks);
        setInteractionMode('default');
        setPendingArcStart(null);
    }, []);

    return {
        min,
        max,
        viewport,
        points,
        arcs,
        showLabels,
        hideValues,
        snapToTicks,
        interactionMode,
        pendingArcStart,

        setMin,
        setMax,
        setRange,
        zoom,
        zoomIn,
        zoomOut,
        pan,
        applyPreset,
        reset,

        addPoint,
        removePoint,
        movePoint,
        togglePointHidden,
        revealAllPoints,
        hideAllPoints,
        handleLineClick,
        handlePointClick,

        addArc,
        removeArc,

        setShowLabels,
        setHideValues,
        setSnapToTicks,
        setInteractionMode,
        setPendingArcStart,

        initFromState
    };
}
