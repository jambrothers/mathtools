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
