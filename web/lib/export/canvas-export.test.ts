/**
 * Unit tests for canvas export utilities
 * 
 * These tests verify the core export functionality for both SVG and PNG formats.
 * Tests are written first (TDD approach) before implementation.
 */

import {
    exportSVGElement,
    exportHTMLElement,
    exportCanvasContent,
    ExportOptions,
    ContentExportOptions,
    triggerDownload, // Added import
} from './canvas-export';
import * as htmlToImage from 'html-to-image'; // Added import

// Mock html-to-image at the top level
jest.mock('html-to-image', () => ({
    toPng: jest.fn(() => Promise.resolve('data:image/png;base64,mock')),
    toSvg: jest.fn(() => Promise.resolve('data:image/svg+xml;utf8,mock')),
}));

describe('canvas-export', () => {
    beforeEach(() => {
        // Clear all mocks and restore implementations before each test
        jest.clearAllMocks();
        jest.restoreAllMocks();
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

    describe('exportHTMLElement', () => {
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

    describe('exportCanvasContent', () => {
        let parent: HTMLElement;
        let child1: HTMLElement;
        let child2: HTMLElement;

        beforeEach(() => {
            parent = document.createElement('div');
            child1 = document.createElement('div');
            child2 = document.createElement('div');
            parent.appendChild(child1);
            parent.appendChild(child2);
            document.body.appendChild(parent);

            // Mock getBoundingClientRect
            jest.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
                left: 0, top: 0, width: 1000, height: 1000, right: 1000, bottom: 1000, x: 0, y: 0, toJSON: () => {}
            });
            jest.spyOn(child1, 'getBoundingClientRect').mockReturnValue({
                left: 100, top: 100, width: 100, height: 100, right: 200, bottom: 200, x: 100, y: 100, toJSON: () => {}
            });
            jest.spyOn(child2, 'getBoundingClientRect').mockReturnValue({
                left: 300, top: 100, width: 100, height: 100, right: 400, bottom: 200, x: 300, y: 100, toJSON: () => {}
            });

            // Mock getComputedStyle
            jest.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
                return {
                    display: 'block',
                    visibility: 'visible',
                    opacity: '1',
                } as CSSStyleDeclaration;
            });
        });

        afterEach(() => {
            if (document.body.contains(parent)) {
                document.body.removeChild(parent);
            }
        });

        it('should clone content, wrap it, and export as PNG', async () => {
            const options: ContentExportOptions = {
                format: 'png',
                filename: 'test-content',
                elements: [child1, child2],
                padding: 10
            };

            // Mock parent clone
            // JSDOM handles cloning, so we don't need to mock it unless we want strict control
            // But we need to make sure the clone logic works.

            // We mock document.body.appendChild to catch the wrapper
            // But exportHTMLElement appends link to body too.
            // Let's just spy on htmlToImage.toPng

            await exportCanvasContent(options);

            // Verify toPng was called with an element that has correct properties
            expect(htmlToImage.toPng).toHaveBeenCalled();
            const wrapper = (htmlToImage.toPng as jest.Mock).mock.calls[0][0] as HTMLElement;

            expect(wrapper.style.position).toBe('fixed');
            // Bounds: minX=100, maxX=400, width=300 + 20 (padding*2) = 320
            // minY=100, maxY=200, height=100 + 20 (padding*2) = 120
            expect(wrapper.style.width).toBe('320px');
            expect(wrapper.style.height).toBe('120px');

            // Verify wrapper is removed
            // Wait, exportHTMLElement removes the link, but exportCanvasContent removes the wrapper.
            // Since we mocked htmlToImage, exportHTMLElement will resolve.
            // We can check if document.body contains wrapper (it shouldn't).
            expect(document.body.contains(wrapper)).toBe(false);

            // Verify content is inside
            expect(wrapper.children.length).toBe(1); // The cloned parent
            const clonedParent = wrapper.children[0] as HTMLElement;
            // Original parent has 2 children, both selected.
            expect(clonedParent.children.length).toBe(2);
        });

        it('should handle single element export', async () => {
             const options: ContentExportOptions = {
                format: 'png',
                filename: 'test-single',
                elements: [child1],
                padding: 20
            };

            await exportCanvasContent(options);

            expect(htmlToImage.toPng).toHaveBeenCalled();
            const wrapper = (htmlToImage.toPng as jest.Mock).mock.calls[0][0] as HTMLElement;

            // Bounds: 100-200 (width 100) -> +40 padding = 140
            expect(wrapper.style.width).toBe('140px');

             // Verify content
            const clonedParent = wrapper.children[0] as HTMLElement;
            // Only child1 was selected, so child2 should be removed from clone.
            expect(clonedParent.children.length).toBe(1);
        });

        it('should warn and return if no elements provided', async () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            await exportCanvasContent({
                format: 'png',
                filename: 'test',
                elements: []
            });
            expect(consoleSpy).toHaveBeenCalledWith('No elements to export');
            expect(htmlToImage.toPng).not.toHaveBeenCalled();
        });

         it('should warn if elements do not share parent', async () => {
             const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
             const orphan = document.createElement('div');
             document.body.appendChild(orphan);

             await exportCanvasContent({
                format: 'png',
                filename: 'test',
                elements: [child1, orphan]
            });
            expect(consoleSpy).toHaveBeenCalledWith('All exported elements must share the same parent');
            expect(htmlToImage.toPng).not.toHaveBeenCalled();
            document.body.removeChild(orphan);
        });
    });
});
