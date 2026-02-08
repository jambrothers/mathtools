export interface RectBounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export function rectsIntersect(a: RectBounds, b: RectBounds): boolean {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

export function selectIdsByRect<T>(
    items: T[],
    rect: DOMRect,
    getBounds: (item: T) => RectBounds,
    getId: (item: T) => string | number
): Set<string | number> {
    const selection = new Set<string | number>();
    const rectBounds: RectBounds = {
        left: rect.x,
        top: rect.y,
        right: rect.x + rect.width,
        bottom: rect.y + rect.height
    };

    items.forEach(item => {
        const bounds = getBounds(item);
        if (rectsIntersect(bounds, rectBounds)) {
            selection.add(getId(item));
        }
    });

    return selection;
}
