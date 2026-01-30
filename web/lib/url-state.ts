/**
 * Generic URL state serialization utilities.
 * Can be extended by any tool to add URL state persistence.
 * 
 * Usage:
 * 1. Define a state interface for your tool
 * 2. Implement URLStateSerializer<YourState>
 * 3. Use generateShareableURL() to create shareable links
 * 4. Use your serializer.deserialize() to restore state from URL
 */

/**
 * Interface for a serializer/deserializer pair.
 * Implement this for each tool that needs URL state persistence.
 */
export interface URLStateSerializer<T> {
    /** Serialize state to URL search params */
    serialize: (state: T) => URLSearchParams;
    /** Deserialize URL search params to state (returns null if invalid/empty) */
    deserialize: (params: URLSearchParams) => T | null;
}

// ============================================
// Boolean Helpers
// ============================================

/**
 * Serialize a boolean value to compact "0" or "1" format.
 * @param value - The boolean to serialize
 * @returns "1" for true, "0" for false
 */
export function serializeBool(value: boolean): string {
    return value ? '1' : '0';
}

/**
 * Deserialize a "0"/"1" string to boolean.
 * @param value - The string value from URL params (may be null)
 * @param defaultValue - Default value if param is missing (defaults to false)
 * @returns The boolean value
 */
export function deserializeBool(value: string | null, defaultValue: boolean = false): boolean {
    if (value === null) return defaultValue;
    return value === '1';
}

// ============================================
// Number Helpers
// ============================================

/**
 * Serialize a number to string.
 * @param value - The number to serialize
 * @returns String representation of the number
 */
export function serializeNumber(value: number): string {
    return String(value);
}

/**
 * Deserialize a string to number.
 * @param value - The string value from URL params (may be null)
 * @param defaultValue - Default value if param is missing or invalid (defaults to 0)
 * @returns The number value
 */
export function deserializeNumber(value: string | null, defaultValue: number = 0): number {
    if (value === null) return defaultValue;
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

// ============================================
// String Helpers
// ============================================

/**
 * Deserialize a string with a default fallback.
 * @param value - The string value from URL params (may be null)
 * @param defaultValue - Default value if param is missing
 * @returns The string value or default
 */
export function deserializeString(value: string | null, defaultValue: string): string {
    return value ?? defaultValue;
}

// ============================================
// URL Generation & Clipboard
// ============================================

/**
 * Generate a shareable URL with the given state.
 * @param serializer - The serializer to use for the state
 * @param state - The state to serialize
 * @param baseUrl - Optional base URL (defaults to current window location)
 * @returns The full shareable URL string
 */
export function generateShareableURL<T>(
    serializer: URLStateSerializer<T>,
    state: T,
    baseUrl?: string
): string {
    const params = serializer.serialize(state);
    const base = baseUrl ?? `${window.location.origin}${window.location.pathname}`;
    const queryString = params.toString();
    return queryString ? `${base}?${queryString}` : base;
}

/**
 * Copy a URL to the clipboard.
 * @param url - The URL to copy
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function copyURLToClipboard(url: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(url);
        return true;
    } catch {
        // Fallback for older browsers or permission issues
        try {
            const textArea = document.createElement('textarea');
            textArea.value = url;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch {
            return false;
        }
    }
}
