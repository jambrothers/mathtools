/**
 * Unit tests for canvas export utilities
 * 
 * These tests verify the core export functionality for both SVG and PNG formats.
 * Tests are written first (TDD approach) before implementation.
 */

import {
    exportSVGElement,
    exportHTMLElement,
    ExportOptions,
    triggerDownload, // Added import
} from './canvas-export';
import * as htmlToImage from 'html-to-image'; // Added import

describe('canvas-export', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('exportSVGElement', () => {
        it('should serialize SVG element and trigger download for SVG format', async () => {
            // Create a mock SVG element
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '800');
            svg.setAttribute('height', '600');
            svg.setAttribute('viewBox', '0 0 800 600');

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '400');
            circle.setAttribute('cy', '300');
            circle.setAttribute('r', '50');
            circle.setAttribute('fill', 'blue');
            svg.appendChild(circle);

            // Mock URL.createObjectURL and URL.revokeObjectURL
            const mockObjectURL = 'blob:mock-url';
            global.URL.createObjectURL = jest.fn(() => mockObjectURL);
            global.URL.revokeObjectURL = jest.fn();

            // Mock document.createElement and appendChild/removeChild for download link
            const mockLink = {
                href: '',
                download: '',
                click: jest.fn(),
            } as unknown as HTMLAnchorElement;
            const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
            const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
            jest.spyOn(document, 'createElement').mockReturnValue(mockLink);

            const options: ExportOptions = {
                format: 'svg',
                filename: 'test-graph',
                backgroundColor: 'transparent',
            };

            await exportSVGElement(svg, options);

            // Verify download link was created and clicked
            expect(document.createElement).toHaveBeenCalledWith('a');
            expect(mockLink.click).toHaveBeenCalled();
            expect(mockLink.download).toMatch(/test-graph.*\.svg$/);
            expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
            expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
        });

        it('should include timestamp in filename', async () => {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100');
            svg.setAttribute('height', '100');

            const mockLink = {
                href: '',
                download: '',
                click: jest.fn(),
            } as unknown as HTMLAnchorElement;
            jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
            jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
            jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
            global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

            const options: ExportOptions = {
                format: 'svg',
                filename: 'test',
            };

            await exportSVGElement(svg, options);

            // Filename should include timestamp
            expect(mockLink.download).toMatch(/test-\d+\.svg$/);
        });
    });

    // Mock html-to-image
    jest.mock('html-to-image', () => ({
        toPng: jest.fn(() => Promise.resolve('data:image/png;base64,mock')),
        toSvg: jest.fn(() => Promise.resolve('data:image/svg+xml;utf8,mock')),
    }));

    describe.skip('exportHTMLElement', () => {
        it('should call toPng for PNG format and trigger download', async () => {
            const element = document.createElement('div');
            const options: ExportOptions = {
                format: 'png',
                filename: 'test',
            };

            const mockLink = {
                href: '',
                download: '',
                click: jest.fn(),
            } as unknown as HTMLAnchorElement;
            jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
            jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
            jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);

            await exportHTMLElement(element, options);

            expect(htmlToImage.toPng).toHaveBeenCalledWith(
                element,
                expect.objectContaining({ pixelRatio: 2 })
            );
            expect(mockLink.download).toMatch(/test-\d+\.png$/);
            expect(mockLink.click).toHaveBeenCalled();
        });

        it('should call toSvg for SVG format and trigger download', async () => {
            const element = document.createElement('div');
            const options: ExportOptions = {
                format: 'svg',
                filename: 'test',
            };

            const mockLink = {
                href: '',
                download: '',
                click: jest.fn(),
            } as unknown as HTMLAnchorElement;
            jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
            jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
            jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);

            await exportHTMLElement(element, options);

            expect(htmlToImage.toSvg).toHaveBeenCalledWith(
                element,
                expect.anything()
            );
            expect(mockLink.download).toMatch(/test-\d+\.svg$/);
            expect(mockLink.click).toHaveBeenCalled();
        });
    });

    describe('triggerDownload', () => {
        it('should create download link and trigger click', () => {

            const mockBlob = new Blob(['test'], { type: 'text/plain' });
            const mockObjectURL = 'blob:mock-url';

            global.URL.createObjectURL = jest.fn(() => mockObjectURL);
            global.URL.revokeObjectURL = jest.fn();

            const mockLink = {
                href: '',
                download: '',
                click: jest.fn(),
            } as unknown as HTMLAnchorElement;

            jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
            jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
            jest.spyOn(document, 'createElement').mockReturnValue(mockLink);

            triggerDownload(mockBlob, 'test-file.txt');

            expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
            expect(mockLink.href).toBe(mockObjectURL);
            expect(mockLink.download).toBe('test-file.txt');
            expect(mockLink.click).toHaveBeenCalled();
            expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockObjectURL);
        });
    });
});
