import { exportHTMLElement, ExportOptions } from './canvas-export';
import * as htmlToImage from 'html-to-image';

// Mock html-to-image
jest.mock('html-to-image', () => ({
    toPng: jest.fn(),
    toSvg: jest.fn(),
}));

describe('exportHTMLElement retry logic', () => {
    let mockLink: HTMLAnchorElement;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock DOM elements for download trigger
        mockLink = {
            href: '',
            download: '',
            click: jest.fn(),
        } as unknown as HTMLAnchorElement;

        jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
        jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
        jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);

        // Mock console to avoid noise
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should retry with fontEmbedCSS: "" if toPng fails first time', async () => {
        const element = document.createElement('div');
        const options: ExportOptions = {
            format: 'png',
            filename: 'test-retry',
            scale: 2
        };

        // First call rejects, second resolves
        (htmlToImage.toPng as jest.Mock)
            .mockRejectedValueOnce(new Error('Font error'))
            .mockResolvedValueOnce('data:image/png;base64,success');

        await exportHTMLElement(element, options);

        expect(htmlToImage.toPng).toHaveBeenCalledTimes(2);

        // First call
        expect(htmlToImage.toPng).toHaveBeenNthCalledWith(1, element, expect.objectContaining({
            pixelRatio: 2,
            backgroundColor: undefined
        }));

        // Second call (retry)
        expect(htmlToImage.toPng).toHaveBeenNthCalledWith(2, element, expect.objectContaining({
            pixelRatio: 2,
            fontEmbedCSS: '',
            backgroundColor: undefined
        }));

        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('Export failed, retrying without font embedding'),
            expect.any(Error)
        );

        // Should succeed eventually
        expect(mockLink.click).toHaveBeenCalled();
    });

    it('should throw error if retry also fails', async () => {
        const element = document.createElement('div');
        const options: ExportOptions = {
            format: 'png',
            filename: 'test-fail',
        };

        // Both calls reject
        (htmlToImage.toPng as jest.Mock)
            .mockRejectedValue(new Error('Persistent error'));

        await expect(exportHTMLElement(element, options)).rejects.toThrow('Persistent error');

        expect(htmlToImage.toPng).toHaveBeenCalledTimes(2);
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('Export failed completely'),
            expect.any(Error)
        );
    });

    it('should retry with fontEmbedCSS: "" if toSvg fails first time', async () => {
        const element = document.createElement('div');
        const options: ExportOptions = {
            format: 'svg',
            filename: 'test-retry-svg',
        };

        // First call rejects, second resolves
        (htmlToImage.toSvg as jest.Mock)
            .mockRejectedValueOnce(new Error('Font error'))
            .mockResolvedValueOnce('data:image/svg+xml;base64,success');

        await exportHTMLElement(element, options);

        expect(htmlToImage.toSvg).toHaveBeenCalledTimes(2);

        // Second call (retry)
        expect(htmlToImage.toSvg).toHaveBeenNthCalledWith(2, element, expect.objectContaining({
            fontEmbedCSS: '',
            backgroundColor: undefined
        }));

        expect(mockLink.click).toHaveBeenCalled();
    });
});
