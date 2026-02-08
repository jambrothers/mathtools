"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

/**
 * Props for the ToolCard component.
 */
interface ToolCardProps {
    /** The title of the tool. */
    title: string
    /** A short description of what the tool does. */
    description: string
    /** The URL to navigate to when the card is clicked. */
    href: string
    /**
     * @deprecated Currently unused in the design.
     * Original intent was for gradient backgrounds, but design now favors solid colors.
     */
    gradient: string
    /** Optional icon component (Lucide Icon) to display. */
    icon?: React.ReactNode
}

/**
 * A card component used to display a link to a specific tool.
 *
 * Design Adherence:
 * - Uses `rounded-xl` and `shadow-sm` as per DESIGN.md specifications for cards.
 * - Interactive states include `hover:shadow-md` and subtle transforms.
 * - Typography uses the designated `--font-heading` for titles and muted text for descriptions.
 */
export function ToolCard({ title, description, href, icon }: ToolCardProps) {
    return (
        <Link
            href={href}
            className="group relative block w-full h-full"
        >
            <div className="relative h-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
                <div className="relative z-10">
                    <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-[var(--theme-page)] p-3 border border-[var(--theme-border)]">
                        {icon}
                    </div>

                    <h3 className="mb-2 text-xl font-bold tracking-tight text-[var(--theme-main)] group-hover:text-[var(--color-primary)] transition-colors font-[family-name:var(--font-heading)]">
                        {title}
                    </h3>
                    <p className="text-[var(--theme-muted)] leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="relative z-10 mt-6 flex items-center font-medium text-[var(--color-primary)] group-hover:translate-x-1 transition-transform">
                    Launch Tool<ArrowRight className="ml-2 w-4 h-4" />
                </div>
            </div>
        </Link>
    )
}

