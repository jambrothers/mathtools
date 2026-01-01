import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { MainContentWrapper } from "@/components/main-content-wrapper";
import { Footer } from "@/components/footer";
import { PageTitleProvider } from "@/components/page-title-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MathTools",
  description: "A collection of interactive mathematics teaching tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PageTitleProvider>
            <Navbar />
            <MainContentWrapper>
              {children}
            </MainContentWrapper>
            <Footer />
          </PageTitleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
