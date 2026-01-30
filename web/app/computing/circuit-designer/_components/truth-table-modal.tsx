"use client"

import * as React from "react"
import { X, Table, RefreshCw } from "lucide-react"
import { TruthTableData } from "../constants"

interface TruthTableModalProps {
    data: TruthTableData
    onClose: () => void
    onRefresh: () => void
}

/**
 * Modal component displaying the generated truth table for the circuit.
 */
export function TruthTableModal({ data, onClose, onRefresh }: TruthTableModalProps) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-600 max-w-2xl w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-xl">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <Table size={20} /> Truth Table
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Table Content */}
                <div className="p-6 overflow-auto">
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr>
                                {data.inputs.map(input => (
                                    <th key={input.id} className="p-3 border-b-2 border-slate-200 dark:border-slate-600 text-amber-600 dark:text-yellow-500 font-mono bg-slate-50 dark:bg-slate-800/50">
                                        {input.label}
                                    </th>
                                ))}
                                <th className="w-8 border-b-2 border-slate-200 dark:border-slate-600"></th>
                                {data.outputs.map(output => (
                                    <th key={output.id} className="p-3 border-b-2 border-slate-200 dark:border-slate-600 text-sky-600 dark:text-blue-400 font-mono bg-slate-50 dark:bg-slate-800/50">
                                        {output.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="font-mono text-sm">
                            {data.rows.map((row, i) => (
                                <tr key={i} className={`hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                                    {row.inputs.map((val, idx) => (
                                        <td key={idx} className={`p-3 border-b border-slate-100 dark:border-slate-700 ${val ? 'text-green-600 dark:text-green-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                                            {val}
                                        </td>
                                    ))}
                                    <td className="border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-600">→</td>
                                    {row.outputs.map((val, idx) => (
                                        <td key={idx} className={`p-3 border-b border-slate-100 dark:border-slate-700 ${val ? 'text-green-600 dark:text-green-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                                            {val}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center rounded-b-xl">
                    <span>{data.rows.length} Combinations Generated</span>
                    <button onClick={onRefresh} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-white transition-colors">
                        <RefreshCw size={12} /> Refresh
                    </button>
                </div>
            </div>
        </div>
    )
}
