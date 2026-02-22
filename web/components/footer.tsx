import { Mail, Twitter } from "lucide-react"
import { BlueskyIcon } from "./icons/bluesky-icon"

/**
 * The application footer.
 *
 * Contains:
 * - Copyright information.
 * - Social media links (GitHub, LinkedIn, Bluesky).
 * - Contact email link.
 *
 * Design:
 * - Uses a muted background and border-top for separation.
 * - Responsive layout: Column on mobile, row on desktop.
 */
export function Footer() {
    return (
        <footer className="border-t border-[var(--theme-border)] bg-[var(--theme-page)] min-h-[100px] flex flex-col justify-center mt-auto">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[var(--theme-muted)] text-sm">
                    © {new Date().getFullYear()} TeachMaths.net. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                    {/* <a href="#" aria-label="LinkedIn" className="text-[var(--theme-muted)] hover:text-[var(--theme-main)] transition-colors">
                        <Linkedin size={20} />
                    </a> */}
                    <a href="https://bsky.app/profile/teachmaths.bsky.social" aria-label="Bluesky" className="text-[var(--theme-muted)] hover:text-[var(--theme-main)] transition-colors">
                        <BlueskyIcon size={20} />
                    </a>
                    <a href="https://x.com/JoTeachMaths" aria-label="X (Twitter)" className="text-[var(--theme-muted)] hover:text-[var(--theme-main)] transition-colors">
                        <Twitter size={20} />
                    </a>
                    <a href="mailto:help@teachmaths.net" aria-label="Email" className="text-[var(--theme-muted)] hover:text-[var(--theme-main)] transition-colors">
                        <Mail size={20} />
                    </a>
                </div>

            </div>
        </footer>
    )
}
