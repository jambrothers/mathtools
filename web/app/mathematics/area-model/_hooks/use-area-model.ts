"use client";

import { useState, useCallback, useMemo } from 'react';
import { useHistory } from '@/lib/hooks/use-history';
import {
    AreaModel,
    PartialProduct,
    buildModel,
    computePartialProducts,
    computeTotal,
    isAlgebraic,
    adjustLastConstant
} from '../_lib/area-model-logic';

interface AreaModelInputState {
    factorA: string;
    factorB: string;
    autoPartition: boolean;
}

export function useAreaModel() {
    // History manages the input state
    const {
        state: inputState,
        pushState: setInputState,
        undo,
        canUndo,
    } = useHistory<AreaModelInputState>({
        factorA: '',
        factorB: '',
        autoPartition: false
    });

    const { factorA, factorB, autoPartition } = inputState;

    // Model state (derived from input state on visualise)
    const [model, setModel] = useState<AreaModel | null>(null);
    const [products, setProducts] = useState<PartialProduct[][] | null>(null);
    const [total, setTotal] = useState<string>('');

    // Visibility toggles (not in history to avoid polluting)
    const [showFactorLabels, setShowFactorLabels] = useState(true);
    const [showPartialProducts, setShowPartialProducts] = useState(true);
    const [showTotal, setShowTotal] = useState(true);
    const [showGridLines, setShowGridLines] = useState(true);
    const [showArray, setShowArray] = useState(false);

    // Progressive reveal
    const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());

    const isAlgebraicModel = useMemo(() => model ? isAlgebraic(model) : false, [model]);

    const setFactorA = useCallback((v: string) => {
        setInputState(prev => ({ ...prev, factorA: v }));
    }, [setInputState]);

    const setFactorB = useCallback((v: string) => {
        setInputState(prev => ({ ...prev, factorB: v }));
    }, [setInputState]);

    const setAutoPartition = useCallback((v: boolean | ((p: boolean) => boolean)) => {
        setInputState(prev => ({
            ...prev,
            autoPartition: typeof v === 'function' ? v(prev.autoPartition) : v
        }));
    }, [setInputState]);

    const visualise = useCallback(() => {
        const newModel = buildModel(factorA, factorB, autoPartition);
        const newProducts = computePartialProducts(newModel);
        const newTotal = computeTotal(newProducts, newModel);

        setModel(newModel);
        setProducts(newProducts);
        setTotal(newTotal);

        const allCells = new Set<string>();
        newProducts.forEach((row, i) => {
            row.forEach((_, j) => {
                allCells.add(`${i}-${j}`);
            });
        });
        setRevealedCells(allCells);
    }, [factorA, factorB, autoPartition]);

    const clear = useCallback(() => {
        setInputState({
            factorA: '',
            factorB: '',
            autoPartition: false
        });
        setModel(null);
        setProducts(null);
        setTotal('');
        setRevealedCells(new Set());
        setShowArray(false);
    }, [setInputState]);

    const toggleFactorLabels = useCallback(() => setShowFactorLabels(prev => !prev), []);
    const togglePartialProducts = useCallback(() => setShowPartialProducts(prev => !prev), []);
    const toggleTotal = useCallback(() => setShowTotal(prev => !prev), []);
    const toggleGridLines = useCallback(() => setShowGridLines(prev => !prev), []);
    const toggleArray = useCallback(() => {
        if (!isAlgebraicModel) {
            setShowArray(prev => !prev);
        }
    }, [isAlgebraicModel]);

    const revealCell = useCallback((key: string) => {
        setRevealedCells(prev => {
            const next = new Set(prev);
            next.add(key);
            return next;
        });
    }, []);

    const revealAll = useCallback(() => {
        if (!products) return;
        const allCells = new Set<string>();
        products.forEach((row, i) => {
            row.forEach((_, j) => {
                allCells.add(`${i}-${j}`);
            });
        });
        setRevealedCells(allCells);
    }, [products]);

    const hideAll = useCallback(() => {
        setRevealedCells(new Set());
    }, []);

    const incrementFactorA = useCallback(() => {
        setFactorA(adjustLastConstant(factorA, 1));
    }, [factorA, setFactorA]);

    const decrementFactorA = useCallback(() => {
        setFactorA(adjustLastConstant(factorA, -1));
    }, [factorA, setFactorA]);

    const incrementFactorB = useCallback(() => {
        setFactorB(adjustLastConstant(factorB, 1));
    }, [factorB, setFactorB]);

    const decrementFactorB = useCallback(() => {
        setFactorB(adjustLastConstant(factorB, -1));
    }, [factorB, setFactorB]);

    return {
        model,
        products,
        total,
        factorA,
        factorB,
        setFactorA,
        setFactorB,
        autoPartition,
        setAutoPartition,
        showFactorLabels,
        showPartialProducts,
        showTotal,
        showGridLines,
        showArray,
        toggleFactorLabels,
        togglePartialProducts,
        toggleTotal,
        toggleGridLines,
        toggleArray,
        revealedCells,
        revealCell,
        revealAll,
        hideAll,
        visualise,
        clear,
        incrementFactorA,
        decrementFactorA,
        incrementFactorB,
        decrementFactorB,
        isAlgebraic: isAlgebraicModel,
        undo,
        canUndo
    };
}
