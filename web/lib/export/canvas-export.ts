/**
 * Canvas Export Utilities
 * 
 * Shared utilities for exporting canvas content (SVG or HTML) as PNG or SVG files.
 * Supports transparent backgrounds for use in presentations.
 */

export interface ExportOptions {
    /** Export format: 'png' or 'svg' */
    format: 'png' | 'svg';
    /** Base filename (without extension or timestamp) */
    filename: string;
    /** Background color for PNG exports. Use 'transparent' for no background. Default: 'transparent' */
    backgroundColor?: string;
    /** Scale factor for PNG exports (for retina displays). Default: 2 */
    scale?: number;
}

/**
 * Export an SVG element as PNG or SVG file.
 * 
 * @param svgElement - The SVG element to export
 * @param options - Export options
 */
export async function exportSVGElement(
    svgElement: SVGSVGElement,
    options: ExportOptions
): Promise<void> {
    const { format, filename, backgroundColor = 'transparent', scale = 2 } = options;

    if (format === 'svg') {
        // Serialize SVG and download
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        triggerDownload(blob, `${filename}-${Date.now()}.svg`);
    } else {
        // Convert SVG to PNG
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        // Get SVG dimensions
        const width = parseInt(svgElement.getAttribute('width') || '800');
        const height = parseInt(svgElement.getAttribute('height') || '600');

        await convertSVGToPNG(url, width, height, backgroundColor, scale, filename);
        URL.revokeObjectURL(url);
    }
}

/**
 * Export an HTML element as PNG or SVG file.
 * Uses html-to-image library to handle styles, fonts, and images correctly.
 * Includes retry logic for Firefox font embedding issues.
 * 
 * @param element - The HTML element to export
 * @param options - Export options
 */
export async function exportHTMLElement(
    element: HTMLElement,
    options: ExportOptions
): Promise<void> {
    const { format, filename, backgroundColor = 'transparent', scale = 2 } = options;

    // Dynamically import html-to-image to avoid SSR issues
    // and only load explicit client-side module when needed
    const { toPng, toSvg } = await import('html-to-image');

    try {
        if (format === 'svg') {
            const dataUrl = await toSvg(element, {
                backgroundColor: backgroundColor === 'transparent' ? undefined : backgroundColor,
            });
            triggerDownloadFromDataURL(dataUrl, `${filename}-${Date.now()}.svg`);
        } else {
            const dataUrl = await toPng(element, {
                backgroundColor: backgroundColor === 'transparent' ? undefined : backgroundColor,
                pixelRatio: scale,
            });
            triggerDownloadFromDataURL(dataUrl, `${filename}-${Date.now()}.png`);
        }
    } catch (error) {
        console.warn('Export failed, retrying without font embedding...', error);

        try {
            // Retry without font embedding (fixes Firefox "font is undefined" error)
            // fontEmbedCSS: '' skips fetching and embedding fonts
            const retryOptions = {
                backgroundColor: backgroundColor === 'transparent' ? undefined : backgroundColor,
                pixelRatio: scale,
                fontEmbedCSS: '',
            };

            if (format === 'svg') {
                const dataUrl = await toSvg(element, retryOptions);
                triggerDownloadFromDataURL(dataUrl, `${filename}-${Date.now()}.svg`);
            } else {
                const dataUrl = await toPng(element, retryOptions);
                triggerDownloadFromDataURL(dataUrl, `${filename}-${Date.now()}.png`);
            }
        } catch (retryError) {
            console.error('Export failed completely:', retryError);
            throw retryError;
        }
    }
}

/**
 * Trigger a file download from a Data URL string.
 */
function triggerDownloadFromDataURL(dataUrl: string, filename: string) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Convert an SVG (from URL) to PNG and trigger download.
 * 
 * @param svgUrl - Blob URL of the SVG
 * @param width - Original width
 * @param height - Original height
 * @param backgroundColor - Background color
 * @param scale - Scale factor
 * @param filename - Base filename
 */
async function convertSVGToPNG(
    svgUrl: string,
    width: number,
    height: number,
    backgroundColor: string,
    scale: number,
    filename: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        // Fix for tainted canvas
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width * scale;
            canvas.height = height * scale;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Apply background if not transparent
            if (backgroundColor !== 'transparent') {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Draw the image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            try {
                // Convert to PNG and download
                const pngUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = pngUrl;
                link.download = `${filename}-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                resolve();
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load SVG image'));
        };

        img.src = svgUrl;
    });
}

/**
 * Trigger a file download with the given blob and filename.
 * 
 * @param blob - The blob to download
 * @param filename - The filename to use
 */
export function triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export interface ContentExportOptions extends ExportOptions {
    /** Elements to include in the export */
    elements: HTMLElement[];
    /** Padding around the content in pixels. Default: 20 */
    padding?: number;
}

/**
 * Export specific canvas elements by cloning them into a temporary container.
 * This allows exporting only the content (e.g. bars, counters) without the grid background,
 * and with a tight bounding box around the content.
 */
export async function exportCanvasContent(options: ContentExportOptions): Promise<void> {
    const { elements, padding = 20, ...exportOptions } = options;

    if (!elements || elements.length === 0) {
        console.warn('No elements to export');
        return;
    }

    // Ensure all elements share the same parent for this strategy
    const parent = elements[0].parentElement;
    if (!parent || !elements.every(el => el.parentElement === parent)) {
        console.warn('All exported elements must share the same parent');
        return;
    }

    // 1. Mark elements to keep
    const marker = `export-keep-${Date.now()}`;
    elements.forEach(el => el.setAttribute('data-export-keep', marker));

    try {
        // 2. Compute bounding box of content (in screen coords)
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        const visibleElements = elements.filter(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        });

        if (visibleElements.length === 0) return;

        visibleElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                minX = Math.min(minX, rect.left);
                minY = Math.min(minY, rect.top);
                maxX = Math.max(maxX, rect.right);
                maxY = Math.max(maxY, rect.bottom);
            }
        });

        if (minX === Infinity) return;

        const width = maxX - minX + (padding * 2);
        const height = maxY - minY + (padding * 2);

        // 3. Clone parent
        const parentClone = parent.cloneNode(true) as HTMLElement;

        // 4. Remove unwanted children from clone
        const children = Array.from(parentClone.children) as HTMLElement[];
        children.forEach(child => {
            if (child.getAttribute('data-export-keep') !== marker) {
                child.remove();
            } else {
                child.removeAttribute('data-export-keep');
            }
        });

        // 5. Setup wrapper
        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.left = '0';
        wrapper.style.top = '0';
        wrapper.style.zIndex = '-9999';
        wrapper.style.width = `${width}px`;
        wrapper.style.height = `${height}px`;
        wrapper.style.backgroundColor = exportOptions.backgroundColor || 'transparent';
        wrapper.style.overflow = 'hidden';

        // 6. Position parent clone inside wrapper to trim
        const parentRect = parent.getBoundingClientRect();

        // Offset of content relative to parent
        const contentLeftRel = minX - parentRect.left;
        const contentTopRel = minY - parentRect.top;

        // Shift parentClone
        parentClone.style.position = 'absolute';
        parentClone.style.left = `${padding - contentLeftRel}px`;
        parentClone.style.top = `${padding - contentTopRel}px`;
        // Ensure parent has dimensions
        parentClone.style.width = `${parentRect.width}px`;
        parentClone.style.height = `${parentRect.height}px`;
        parentClone.style.margin = '0';
        parentClone.style.transform = 'none';

        // Ensure background of parent clone is transparent
        parentClone.style.background = 'transparent';
        parentClone.style.backgroundImage = 'none';

        wrapper.appendChild(parentClone);
        document.body.appendChild(wrapper);

        try {
            await exportHTMLElement(wrapper, exportOptions);
        } finally {
            if (document.body.contains(wrapper)) {
                document.body.removeChild(wrapper);
            }
        }

    } finally {
        // Cleanup marker
        elements.forEach(el => el.removeAttribute('data-export-keep'));
    }
}
