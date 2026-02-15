import { ToolCard } from "@/components/tool-card"
import { Gamepad2 } from "lucide-react"

export default function GamesPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 text-center lg:text-left">
                        <h1 className="text-4xl md:text-6xl font-bold text-[var(--theme-main)] mb-6 font-[family-name:var(--font-heading)]">
                            Classroom <span className="text-[var(--color-primary)]">Games</span>
                        </h1>
                        <p className="text-xl text-[var(--theme-muted)] max-w-2xl">
                            Interactive games designed to engage students and reinforce mathematical concepts through play.
                        </p>
                    </div>

                    <div className="mt-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <ToolCard
                                title="Pointless"
                                description="A classroom game where students aim for obscurity. Can you find the correct answer that nobody else thought of?"
                                href="/games/pointless"
                                gradient="from-indigo-600 to-violet-600"
                                icon={<Gamepad2 className="w-8 h-8 text-indigo-600" />}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
