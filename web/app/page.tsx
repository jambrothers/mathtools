import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative px-4 sm:px-6 lg:px-8 pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

            {/* Hero Text */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--theme-main)] mb-6">
                Interactive mathematics in <br />
                {/*<span className="text-[var(--color-primary)]"> */}
                the classroom
                {/*</span> */}
              </h1>
              <p className="text-lg md:text-xl text-[var(--theme-muted)] max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-8">
                Free, no login tools designed for your classroom. Visualise algebraic concepts, number, circuits and statistics to deepen understanding and aid exposition.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a href="/tools" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white rounded-lg bg-[var(--color-primary)] hover:opacity-90 shadow-sm transition-all duration-200">
                  Explore Tools
                </a>
                <a href="/about" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg text-[var(--theme-main)] bg-[var(--theme-card)] border border-[var(--theme-border)] hover:bg-[var(--theme-border)] transition-colors">
                  Learn More
                </a>
              </div>
            </div>

            {/* Hero Visual / Featured Tool Placeholder or Decoration */}
            <div className="flex-1 w-full max-w-[600px] lg:max-w-full relative">
              <div className="relative rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] shadow-md overflow-hidden">
                <div className="h-[400px] flex items-center justify-center relative">
                  <div className="relative w-full h-full flex items-center justify-center opacity-80">
                    <Image
                      src="/assets/tools.svg"
                      alt="Mathematical Tools Illustration"
                      fill
                      className="object-cover dark:hidden"
                      priority
                      unoptimized
                    />
                    <Image
                      src="/assets/tools-dark.svg"
                      alt="Mathematical Tools Illustration"
                      fill
                      className="object-cover hidden dark:block"
                      priority
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
