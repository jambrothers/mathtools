"use client"

import React, { Suspense, useState, useEffect } from 'react';
import { SetPageTitle } from "@/components/set-page-title";
import { Canvas } from '@/components/tool-ui/canvas';
import { TrashZone } from '@/components/tool-ui/trash-zone';
import { HelpButton } from '@/components/tool-ui/help-button';
import { HelpModal } from '@/components/tool-ui/help-modal';
import { CircuitToolbar } from './_components/circuit-toolbar';
import { CircuitSidebar } from './_components/circuit-sidebar';
import { CircuitNodeComponent } from './_components/circuit-node';
import { TruthTableModal } from './_components/truth-table-modal';
import { useCircuitDesigner } from './_hooks/use-circuit-designer';
import helpContent from './HELP.md';

import {
    getPortPosition,
    getWirePath,
    SNAP_GRID
} from './constants';

function CircuitDesignerLoading() {
    return (
        <div className="flex flex-col flex-1 min-h-0 w-full bg-slate-50 dark:bg-slate-950 items-center justify-center">
            <div className="animate-pulse text-slate-400 dark:text-slate-500">Loading Circuit Designer...</div>
        </div>
    );
}

export default function CircuitDesignerPage() {
    return (
        <Suspense fallback={<CircuitDesignerLoading />}>
            <CircuitDesignerContent />
        </Suspense>
    );
}

function CircuitDesignerContent() {
    const {
        nodes,
        connections,
        wiring,
        mousePos,
        truthTable,
        activeSimulation,
        selectedIds,
        isTrashHovered,
        trashRef,
        canvasRef,
        setTruthTable,
        setSelectedIds,
        handlePointerDownNode,
        toggleInput,
        startWiring,
        completeWiring,
        addNode,
        addNodeAtPosition,
        confirmClear,
        handleMarqueeSelect,
        generateTruthTable,
        loadDemo,
        handleCopyLink,
        getWiringSourceNode,
        undo,
        canUndo
    } = useCircuitDesigner();

    // Drop Handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'circuit-component' && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                addNodeAtPosition(parsed.componentType, x, y);
            }
        } catch (err) {
            console.error('Failed to parse drag data', err);
        }
    };

    // Touch Support for DnD
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleTouchDrop = (e: CustomEvent<{ dragData: { type: string, componentType: any }, clientX: number, clientY: number }>) => {
            const { dragData, clientX, clientY } = e.detail;
            if (dragData?.type === 'circuit-component') {
                const rect = canvas.getBoundingClientRect();
                const x = clientX - rect.left;
                const y = clientY - rect.top;
                addNodeAtPosition(dragData.componentType, x, y);
            }
        };

        canvas.addEventListener('touchdrop', handleTouchDrop as EventListener);
        return () => canvas.removeEventListener('touchdrop', handleTouchDrop as EventListener);
    }, [addNodeAtPosition, canvasRef]);

    // Keyboard shortcut for undo (Ctrl+Z / Cmd+Z)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canUndo) {
                    undo();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canUndo, undo]);

    const [showHelp, setShowHelp] = useState(false);



    return (
        <div className="flex flex-col flex-1 min-h-0 w-full">
            <SetPageTitle title="Circuit Designer" />

            {/* Toolbar */}
            {/* Toolbar */}
            <CircuitToolbar
                onClear={confirmClear}
                onGenerateTruthTable={generateTruthTable}
                onLoadDemo={loadDemo}
                onCopyLink={handleCopyLink}
                onUndo={undo}
                canUndo={canUndo}
            />

            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar */}
                <CircuitSidebar onAddNode={addNode} />

                {/* Canvas Area */}
                <Canvas
                    ref={canvasRef}
                    data-testid="canvas"
                    className="flex-1 relative bg-slate-50 dark:bg-slate-950 overflow-hidden cursor-crosshair"
                    onClick={() => setSelectedIds(new Set())}
                    onSelectionEnd={handleMarqueeSelect}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >

                    {/* Grid Background */}
                    <div
                        className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#6366f1_1px,transparent_1px)]"
                        style={{
                            backgroundSize: `${SNAP_GRID}px ${SNAP_GRID}px`
                        }}
                    />

                    {/* Connection Layer (SVG) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                        {/* Existing Connections */}
                        {connections.map(conn => {
                            const sourceNode = nodes.find(n => n.id === conn.from);
                            const targetNode = nodes.find(n => n.id === conn.to);
                            if (!sourceNode || !targetNode) return null;

                            const sourcePos = getPortPosition(sourceNode.type, 'output', 0);
                            const targetPos = getPortPosition(targetNode.type, 'input', conn.inputIndex);

                            const x1 = sourceNode.x + sourcePos.x;
                            const y1 = sourceNode.y + sourcePos.y;
                            const x2 = targetNode.x + targetPos.x;
                            const y2 = targetNode.y + targetPos.y;

                            const isActive = activeSimulation[sourceNode.id];

                            return (
                                <path
                                    key={conn.id}
                                    d={getWirePath(x1, y1, x2, y2)}
                                    strokeWidth="3"
                                    fill="none"
                                    className={`transition-colors duration-150 ${isActive ? 'stroke-green-500' : 'stroke-slate-400 dark:stroke-slate-600'}`}
                                />
                            );
                        })}

                        {/* Active Drawing Wire */}
                        {wiring && (() => {
                            const sourceNode = getWiringSourceNode();
                            if (!sourceNode) return null;
                            const sourcePos = getPortPosition(sourceNode.type, 'output', 0);
                            return (
                                <path
                                    d={getWirePath(
                                        sourceNode.x + sourcePos.x,
                                        sourceNode.y + sourcePos.y,
                                        mousePos.x,
                                        mousePos.y
                                    )}
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                    fill="none"
                                    className="opacity-70 stroke-indigo-500"
                                />
                            );
                        })()}
                    </svg>

                    {/* Nodes Layer */}
                    {nodes.map(node => (
                        <CircuitNodeComponent
                            key={node.id}
                            node={node}
                            isActive={activeSimulation[node.id] ?? false}
                            isSelected={selectedIds.has(node.id)}
                            onPointerDown={handlePointerDownNode}
                            onClick={toggleInput}
                            onStartWiring={startWiring}
                            onCompleteWiring={completeWiring}
                        />
                    ))}


                    <TrashZone ref={trashRef} isHovered={isTrashHovered} />
                    <HelpButton onClick={() => setShowHelp(true)} />
                </Canvas>

            </div>

            {/* Truth Table Modal */}
            {truthTable && (
                <TruthTableModal
                    data={truthTable}
                    onClose={() => setTruthTable(null)}
                    onRefresh={generateTruthTable}
                />
            )}



            {/* Help Modal */}
            {showHelp && (
                <HelpModal content={helpContent} onClose={() => setShowHelp(false)} />
            )}
        </div>
    );
}