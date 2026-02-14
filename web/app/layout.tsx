import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
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

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  title: "TeachMaths.net | Interactive mathematics in the classroom",
  description: "A collection of interactive mathematics teaching tools.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${merriweather.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
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
