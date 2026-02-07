import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility to merge Tailwind CSS classes conditionally.
 *
 * Uses `clsx` for conditional classes and `tailwind-merge` to handle conflicts
 * (e.g., ensuring `p-4` overrides `p-2` without specificity wars).
 *
 * @param inputs - List of class names or conditional class objects.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
