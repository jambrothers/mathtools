import { useState, useCallback } from 'react';
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

export function useNumberLine() {
    const [min, setMin] = useState(DEFAULT_VIEWPORT.min);
    const [max, setMax] = useState(DEFAULT_VIEWPORT.max);
    const [points, setPoints] = useState<PointMarker[]>([]);
    const [arcs, setArcs] = useState<JumpArc[]>([]);
    const [showLabels, setShowLabels] = useState(true);
    const [hideValues, setHideValues] = useState(false);
    const [snapToTicks, setSnapToTicks] = useState(true);

    const viewport: Viewport = { min, max };

    // Viewport Actions
    const setRange = useCallback((newMin: number, newMax: number) => {
        const clamped = clampViewport({ min: newMin, max: newMax });
        setMin(clamped.min);
        setMax(clamped.max);
    }, []);

    const zoomIn = useCallback((focalPoint?: number) => {
        const next = zoomViewport(viewport, 1 / ZOOM_FACTOR, focalPoint);
        setMin(next.min);
        setMax(next.max);
    }, [viewport]);

    const zoomOut = useCallback((focalPoint?: number) => {
        const next = zoomViewport(viewport, ZOOM_FACTOR, focalPoint);
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
    }, []);

    // Point Actions
    const addPoint = useCallback((value: number, label?: string) => {
        if (points.length >= MAX_POINTS) return;

        const id = `p-${Date.now()}`;
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
    }, []);

    const movePoint = useCallback((id: string, newValue: number) => {
        setPoints(prev => prev.map(p =>
            p.id === id
                ? { ...p, value: snapToTicks ? snapToTick(newValue, viewport) : newValue }
                : p
        ));
    }, [snapToTicks, viewport]);

    // Arc Actions
    const addArc = useCallback((fromId: string, toId: string, label?: string) => {
        const newArc: JumpArc = { fromId, toId, label };
        setArcs(prev => [...prev, newArc]);
    }, []);

    const removeArc = useCallback((index: number) => {
        setArcs(prev => prev.filter((_, i) => i !== index));
    }, []);

    // Initialization
    const initFromState = useCallback((state: NumberLineState) => {
        setMin(state.min);
        setMax(state.max);
        setPoints(state.points);
        setArcs(state.arcs);
        setShowLabels(state.showLabels);
        setHideValues(state.hideValues);
        setSnapToTicks(state.snapToTicks);
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

        setMin,
        setMax,
        setRange,
        zoomIn,
        zoomOut,
        applyPreset,
        reset,

        addPoint,
        removePoint,
        movePoint,

        addArc,
        removeArc,

        setShowLabels,
        setHideValues,
        setSnapToTicks,

        initFromState
    };
}
