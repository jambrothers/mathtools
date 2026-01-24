import { Github, Linkedin, Mail } from "lucide-react"
import { BlueskyIcon } from "./icons/bluesky-icon"

export function Footer() {
    return (
        <footer className="border-t border-[var(--theme-border)] bg-[var(--theme-page)] min-h-[100px] flex flex-col justify-center mt-auto">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[var(--theme-muted)] text-sm">
                    © {new Date().getFullYear()} TeachMaths.net. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                    <a href="https://github.com/jambrothers/mathtools" className="text-[var(--theme-muted)] hover:text-[var(--theme-main)] transition-colors">
                        <Github size={20} />
                    </a>
                    <a href="#" className="text-[var(--theme-muted)] hover:text-[var(--theme-main)] transition-colors">
                        <Linkedin size={20} />
                    </a>
                    <a href="https://bsky.app" className="text-[var(--theme-muted)] hover:text-[var(--theme-main)] transition-colors">
                        <BlueskyIcon size={20} />
                    </a>
                    <a href="mailto:help@teachmaths.net" className="text-[var(--theme-muted)] hover:text-[var(--theme-main)] transition-colors">
                        <Mail size={20} />
                    </a>
                </div>
            </div>
        </footer>
    )
}
