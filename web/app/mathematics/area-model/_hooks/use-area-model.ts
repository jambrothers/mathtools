"use client";

import { useState, useCallback, useMemo } from 'react';
import {
    AreaModel,
    PartialProduct,
    buildModel,
    computePartialProducts,
    computeTotal,
    isAlgebraic,
    adjustLastConstant
} from '../_lib/area-model-logic';

export function useAreaModel() {
    // Model state
    const [model, setModel] = useState<AreaModel | null>(null);
    const [products, setProducts] = useState<PartialProduct[][] | null>(null);
    const [total, setTotal] = useState<string>('');

    // Input state
    const [factorA, setFactorA] = useState<string>('');
    const [factorB, setFactorB] = useState<string>('');

    // Settings
    const [autoPartition, setAutoPartition] = useState<boolean>(false);

    // Visibility toggles
    const [showFactorLabels, setShowFactorLabels] = useState(true);
    const [showPartialProducts, setShowPartialProducts] = useState(true);
    const [showTotal, setShowTotal] = useState(true);
    const [showGridLines, setShowGridLines] = useState(true);
    const [showArray, setShowArray] = useState(false);

    // Progressive reveal
    const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());

    const isAlgebraicModel = useMemo(() => model ? isAlgebraic(model) : false, [model]);

    const visualise = useCallback(() => {
        const newModel = buildModel(factorA, factorB, autoPartition);
        const newProducts = computePartialProducts(newModel);
        const newTotal = computeTotal(newProducts, newModel);

        setModel(newModel);
        setProducts(newProducts);
        setTotal(newTotal);

        // Auto-reveal if it's a small model, or hide all?
        // User requested progressive revealing, so let's default to reveal all for now
        // unless they specifically want to hide.
        // Actually, following the "predict-observe-explain" pedagogy, maybe default to revealed
        // but give buttons to hide/show all.
        const allCells = new Set<string>();
        newProducts.forEach((row, i) => {
            row.forEach((_, j) => {
                allCells.add(`${i}-${j}`);
            });
        });
        setRevealedCells(allCells);
    }, [factorA, factorB, autoPartition]);

    const clear = useCallback(() => {
        setModel(null);
        setProducts(null);
        setTotal('');
        setFactorA('');
        setFactorB('');
        setRevealedCells(new Set());
        setShowArray(false);
    }, []);

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
        setFactorA(prev => adjustLastConstant(prev, 1));
    }, []);

    const decrementFactorA = useCallback(() => {
        setFactorA(prev => adjustLastConstant(prev, -1));
    }, []);

    const incrementFactorB = useCallback(() => {
        setFactorB(prev => adjustLastConstant(prev, 1));
    }, []);

    const decrementFactorB = useCallback(() => {
        setFactorB(prev => adjustLastConstant(prev, -1));
    }, []);

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
        isAlgebraic: isAlgebraicModel
    };
}
