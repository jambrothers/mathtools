import { ToolCard } from "@/components/tool-card"
import { Grid2x2, Calculator, Cpu, Percent, Hash, Rows2 } from "lucide-react"

export default function ToolsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 text-center lg:text-left">
                        <h1 className="text-4xl md:text-6xl font-bold text-[var(--theme-main)] mb-6 font-[family-name:var(--font-heading)]">
                            Our <span className="text-[var(--color-primary)]">Tools</span>
                        </h1>
                        <p className="text-xl text-[var(--theme-muted)] max-w-2xl">
                            A curated collection of digital manipulatives and teaching aids designed for modern education.
                        </p>
                    </div>

                    <div id="mathematics" className="mt-16">
                        <h2 className="text-2xl font-bold text-[var(--theme-main)] mb-8 font-[family-name:var(--font-heading)]">Mathematics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <ToolCard
                                title="Algebra Tiles"
                                description="Visualize algebraic concepts including expressions, equations, and factorisation with virtual algebraic tiles."
                                href="/mathematics/algebra-tiles"
                                gradient="from-blue-500 to-cyan-500"
                                icon={<Grid2x2 className="w-8 h-8 text-blue-500" />}
                            />
                            <ToolCard
                                title="Double Sided Counters"
                                description="Explore integer and algebraic operations on directed number with interactive two-coloured counters."
                                href="/mathematics/double-sided-counters"
                                gradient="from-purple-500 to-pink-500"
                                icon={<Calculator className="w-8 h-8 text-purple-500" />}
                            />
                            <ToolCard
                                title="Bar Model"
                                description="Create and manipulate bar models to visualize mathematical relationships, with support for splitting into halves and thirds."
                                href="/mathematics/bar-model"
                                gradient="from-amber-500 to-orange-500"
                                icon={<Grid2x2 className="w-8 h-8 text-amber-500" />}
                            />
                            <ToolCard
                                title="Linear Equations"
                                description="Explore y = mx + c by adjusting gradient and y-intercept. Visualize slope triangles, intercepts, and equation labels."
                                href="/mathematics/linear-equations"
                                gradient="from-indigo-500 to-blue-500"
                                icon={<Calculator className="w-8 h-8 text-indigo-500" />}
                            />
                            <ToolCard
                                title="Percentage Grid"
                                description="Paint a 10×10 grid to explore percentages and quickly fill 10%, 25%, or 50%."
                                href="/mathematics/percentage-grid"
                                gradient="from-blue-500 to-sky-500"
                                icon={<Percent className="w-8 h-8 text-blue-500" />}
                            />
                            <ToolCard
                                title="Sequences"
                                description="Explore arithmetic, geometric, and quadratic sequences. Reveal terms one by one and find the nth term rule."
                                href="/mathematics/sequences"
                                gradient="from-indigo-500 to-purple-500"
                                icon={<Hash className="w-8 h-8 text-indigo-500" />}
                            />
                            <ToolCard
                                title="Fraction Wall"
                                description="Visualise unit fractions and equivalence. Shade segments, toggle labels, and use vertical guides to find equal fractions."
                                href="/mathematics/fraction-wall"
                                gradient="from-rose-500 to-orange-500"
                                icon={<Rows2 className="w-8 h-8 text-rose-500" />}
                            />
                            <ToolCard
                                title="Number Line"
                                description="Explore directed number, scale, and decimals. Zoom in/out, place draggable points, and draw directional jump arcs."
                                href="/mathematics/number-line"
                                gradient="from-emerald-500 to-teal-500"
                                icon={<Rows2 className="w-8 h-8 text-emerald-500" />}
                            />
                            <ToolCard
                                title="Area Model"
                                description="Visualise multiplication and algebraic expansion. Auto-partition factors, toggle partial products, and explore with discrete arrays."
                                href="/mathematics/area-model"
                                gradient="from-teal-500 to-cyan-500"
                                icon={<Grid2x2 className="w-8 h-8 text-teal-500" />}
                            />
                        </div>
                    </div>

                    <div id="computing" className="mt-16">
                        <h2 className="text-2xl font-bold text-[var(--theme-main)] mb-8 font-[family-name:var(--font-heading)]">Computing</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <ToolCard
                                title="Circuit Designer"
                                description="Build and simulate logic circuits with AND, OR, NOT, and XOR gates. Generate truth tables to verify circuit behaviour."
                                href="/computing/circuit-designer"
                                gradient="from-emerald-500 to-teal-500"
                                icon={<Cpu className="w-8 h-8 text-emerald-500" />}
                            />
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
