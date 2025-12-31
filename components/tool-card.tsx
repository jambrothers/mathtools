"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface ToolCardProps {
    title: string
    description: string
    href: string
    gradient: string
    icon?: React.ReactNode
}

export function ToolCard({ title, description, href, gradient, icon }: ToolCardProps) {
    return (
        <Link
            href={href}
            className="group relative block w-full h-full"
        >
            <div className={`relative h-full rounded-[2rem] bg-gradient-to-br ${gradient} p-[1px] shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl`}>
                <div className="relative h-full rounded-[calc(2rem-1px)] bg-[var(--theme-card)] p-8 flex flex-col justify-between overflow-hidden">
                    {/* Background decorative glow */}
                    <div className={`absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-[60px] group-hover:opacity-20 transition-opacity duration-500`} />

                    <div className="relative z-10">
                        <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-[var(--theme-page)] p-3 shadow-sm border border-[var(--theme-border)]">
                            {icon}
                        </div>

                        <h3 className="mb-2 text-2xl font-bold tracking-tight text-[var(--theme-main)] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-600 transition-all duration-300">
                            {title}
                        </h3>
                        <p className="text-[var(--theme-muted)] leading-relaxed">
                            {description}
                        </p>
                    </div>

                    <div className="relative z-10 mt-8 flex items-center font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                        Launch Tool <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                </div>
            </div>
        </Link>
    )
}
