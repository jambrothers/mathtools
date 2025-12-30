import { ToolCard } from "@/components/tool-card"
import { Grid2x2, Calculator } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <section className="relative px-4 sm:px-6 lg:px-8 pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

            {/* Hero Text */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--theme-main)] mb-6">
                Bridging the gap <br className="hidden lg:block" />
                between <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Math & Code
                </span>
              </h1>
              <p className="text-lg md:text-xl text-[var(--theme-muted)] max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-8">
                Interactive digital manipulatives designed to make abstract mathematical concepts concrete, accessible, and engaging for every student.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a href="#tools" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 shadow-lg shadow-blue-600/20 transition-all duration-200">
                  Explore Tools
                </a>
                <a href="/about" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl text-[var(--theme-main)] bg-[var(--theme-card)] border border-[var(--theme-border)] hover:bg-[var(--theme-border)] transition-colors">
                  Learn More
                </a>
              </div>
            </div>

            {/* Hero Visual / Featured Tool Placeholder or Decoration */}
            <div className="flex-1 w-full max-w-[600px] lg:max-w-full relative perspective-1000">
              <div className="relative rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-purple-600 p-1 shadow-2xl transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-500">
                <div className="rounded-[2.4rem] bg-[var(--theme-card)] p-8 h-[400px] flex items-center justify-center relative overflow-hidden">
                  <div className="text-[10rem] font-bold text-[var(--theme-muted)]/10 select-none">
                    M
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section id="tools" className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--theme-page)] relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center lg:text-left">
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--theme-main)] mb-4">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Tools</span>
            </h2>
            <p className="text-xl text-[var(--theme-muted)] max-w-2xl">
              A curated collection of digital manipulatives and teaching aids designed for modern mathematics education.
            </p>
          </div>

          <div className="mt-16">
            <h3 className="text-2xl font-bold text-[var(--theme-main)] mb-8">Manipulatives</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ToolCard
                title="Algebra Tiles"
                description="Visualize algebraic concepts including expressions, equations, and factorisation with virtual algebraic tiles."
                href="/manipulatives/algebra-tiles"
                gradient="from-blue-500 to-cyan-500"
                icon={<Grid2x2 className="w-8 h-8 text-blue-500" />}
              />
              <ToolCard
                title="Double Sided Counters"
                description="Explore integer operations, probability, and ratios with interactive two-colored counters."
                href="/manipulatives/double-sided-counters"
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
