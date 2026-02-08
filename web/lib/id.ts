export function createId(prefix?: string): string {
    const base = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    return prefix ? `${prefix}-${base}` : base;
}
