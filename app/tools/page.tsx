import { ToolCard } from "@/components/tool-card"
import { Grid2x2, Calculator } from "lucide-react"

export default function ToolsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
            </div>

            <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 text-center lg:text-left">
                        <h1 className="text-4xl md:text-6xl font-bold text-[var(--theme-main)] mb-6">
                            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Tools</span>
                        </h1>
                        <p className="text-xl text-[var(--theme-muted)] max-w-2xl">
                            A curated collection of digital manipulatives and teaching aids designed for modern mathematics education.
                        </p>
                    </div>

                    <div id="mathematics" className="mt-16">
                        <h2 className="text-2xl font-bold text-[var(--theme-main)] mb-8">Mathematics</h2>
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
                </div>
            </section>
        </div>
    );
}
