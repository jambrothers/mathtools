/**
 * Generic URL state serialization utilities.
 *
 * Architecture:
 * This module provides a standardized way to persist tool state in the URL query parameters.
 * It uses a "Compact String" strategy to minimize URL length, which is critical for sharing.
 *
 * Serialization Format:
 * - State is compressed into short strings using delimiters like `:`, `;`, and `,`.
 * - Example: `type:value,x,y;type:value,x,y`
 *
 * SECURITY WARNING:
 * When serializing user-generated content (like labels or text inputs) into these delimited strings,
 * you MUST use `encodeURIComponent()` to prevent delimiter injection attacks.
 * If a user enters a label containing a delimiter (e.g., "Label:1"), it could break the parsing logic
 * or be malicious.
 * 
 * Usage:
 * 1. Define a state interface for your tool.
 * 2. Implement `URLStateSerializer<YourState>`.
 * 3. Use `generateShareableURL()` to create shareable links.
 * 4. Use your serializer's `deserialize()` method to restore state on load.
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
// List Serialization Helpers
// ============================================

interface ListCodecOptions {
    delimiter?: string;
    maxItems?: number;
    trim?: boolean;
}

/**
 * Serializes a list of items into a delimited string.
 *
 * @param items - The array of items to serialize.
 * @param serializeItem - A function that converts a single item to a string.
 * @param options - Configuration options.
 * @param options.delimiter - The character to use for separating items (default: ';').
 * @returns A single string containing all serialized items separated by the delimiter.
 */
export function serializeList<T>(
    items: T[],
    serializeItem: (item: T) => string,
    options: ListCodecOptions = {}
): string {
    if (!items || items.length === 0) return '';
    const { delimiter = ';' } = options;
    return items.map(serializeItem).join(delimiter);
}

/**
 * Parses a delimited string into a list of items.
 *
 * Security Note:
 * This function enforces a `maxItems` limit (default: 1000) to prevent Denial of Service (DoS)
 * attacks where a malicious URL could cause excessive memory allocation or CPU usage.
 * It also uses an iterative parsing approach to avoid creating large intermediate arrays.
 *
 * @param value - The delimited string to parse (e.g., from a URL parameter).
 * @param parseItem - A function that parses a single substring into an item (returns null if invalid).
 * @param options - Configuration options.
 * @param options.delimiter - The character used to separate items (default: ';').
 * @param options.maxItems - The maximum number of items to parse (default: 1000).
 * @param options.trim - Whether to trim whitespace from each part (default: true).
 * @returns An array of successfully parsed items.
 */
export function parseList<T>(
    value: string | null | undefined,
    parseItem: (part: string) => T | null,
    options: ListCodecOptions = {}
): T[] {
    if (!value || value.trim() === '') return [];
    // SECURITY: Default maxItems to 1000 to prevent DoS via unbounded deserialization
    // Use an iterative approach instead of split() to avoid allocation spikes
    const { delimiter = ';', maxItems = 1000, trim = true } = options;

    const items: T[] = [];
    let startIndex = 0;
    const len = value.length;
    const delimiterLen = delimiter.length;

    // Safety break: if delimiter is empty, fall back to split for character iteration
    if (delimiterLen === 0) {
        const parts = value.split('');
        for (let i = 0; i < parts.length; i++) {
            if (items.length >= maxItems) break;
            const parsed = parseItem(parts[i]);
            if (parsed !== null) items.push(parsed);
        }
        return items;
    }

    while (startIndex < len && items.length < maxItems) {
        let delimiterIndex = value.indexOf(delimiter, startIndex);

        // If no more delimiters, take the rest of the string
        if (delimiterIndex === -1) {
            delimiterIndex = len;
        }

        const raw = value.substring(startIndex, delimiterIndex);
        const processed = trim ? raw.trim() : raw;

        // Move start index past the delimiter
        startIndex = delimiterIndex + delimiterLen;

        if (!processed) continue;

        const parsed = parseItem(processed);
        if (parsed !== null) {
            items.push(parsed);
        }
    }

    return items;
}

export function hasAnyParam(params: URLSearchParams | null | undefined, keys: string[]): boolean {
    if (!params) return false;
    return keys.some(key => params.has(key));
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
