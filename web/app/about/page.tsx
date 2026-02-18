export default function AboutPage() {
    return (
        <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--theme-main)] mb-8 font-[family-name:var(--font-heading)]">
                    About <span className="text-[var(--color-primary)]">TeachMaths.net</span>
                </h1>

                <div className="prose prose-lg dark:prose-invert">
                    <p className="text-xl text-[var(--theme-muted)] leading-relaxed mb-6">
                        TeachMaths.net is a collection of interactive digital tools designed to bridge the gap between abstract mathematical concepts and concrete understanding.
                    </p>

                    <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-8 mb-8">
                        <h2 className="text-2xl font-bold text-[var(--theme-main)] mb-4 font-[family-name:var(--font-heading)]">Our Mission</h2>
                        <p className="text-[var(--theme-muted)]">
                            We believe that every student deserves access to high-quality, intuitive tools that make learning mathematics engaging and accessible. By leveraging modern web technologies, we bring traditional classroom counters, tiles, and more into the digital age.
                        </p>
                    </div>

                    <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-8 mb-8">
                        <h2 className="text-2xl font-bold text-[var(--theme-main)] mb-4 font-[family-name:var(--font-heading)]">Get in Touch</h2>
                        <p className="text-[var(--theme-muted)]">
                            We welcome any feedback and suggestions. Please contact us at{' '}
                            <a href="mailto:help@teachmaths.net" className="text-[var(--color-primary)] hover:underline">
                                help@teachmaths.net
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
