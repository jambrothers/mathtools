import { useState, useCallback, useMemo } from 'react';
import {
    Viewport,
    zoomViewport,
    clampViewport,
    snapToTick
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

export type InteractionMode = 'default' | 'add-arc';

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
        const newArc: JumpArc = { fromId, toId, label };
        setArcs(prev => [...prev, newArc]);
    }, []);

    const removeArc = useCallback((index: number) => {
        setArcs(prev => prev.filter((_, i) => i !== index));
    }, []);

    // Point Actions
    const addPoint = useCallback((value: number, label?: string) => {
        if (points.length >= MAX_POINTS) return;

        const id = `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newPoint: PointMarker = {
            id,
            value: snapToTicks ? snapToTick(value, viewport) : value,
            label,
            color: POINT_COLORS[points.length % POINT_COLORS.length]
        };

        setPoints(prev => [...prev, newPoint]);
        return id;
    }, [points.length, snapToTicks, viewport]);

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

    const handlePointClick = useCallback((id: string) => {
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
    }, [interactionMode, pendingArcStart, addArc]);

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
        applyPreset,
        reset,

        addPoint,
        removePoint,
        movePoint,
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
