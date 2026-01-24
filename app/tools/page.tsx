import { ToolCard } from "@/components/tool-card"
import { Grid2x2, Calculator, Cpu } from "lucide-react"

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
                                description="Explore integer operations, probability, and ratios with interactive two-colored counters."
                                href="/mathematics/double-sided-counters"
                                gradient="from-purple-500 to-pink-500"
                                icon={<Calculator className="w-8 h-8 text-purple-500" />}
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
