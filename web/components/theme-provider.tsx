"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * A wrapper component around `next-themes` ThemeProvider.
 *
 * Purpose:
 * - Enables theme switching (light/dark/system).
 * - Manages the `class` attribute on the `html` element for Tailwind CSS dark mode support.
 * - Prevents hydration mismatch by handling theme initialization.
 *
 * Usage:
 * Wrap the entire application in `layout.tsx` with this provider.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
