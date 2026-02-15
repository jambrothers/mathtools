import { render, screen, fireEvent } from '@testing-library/react';
import { Canvas } from '@/components/tool-ui/canvas';

describe('Canvas Performance', () => {
    let setCaptureSpy: jest.SpyInstance;
    let releaseCaptureSpy: jest.SpyInstance;
    let hasCaptureSpy: jest.SpyInstance;

    beforeEach(() => {
        // Spy on setPointerCapture/releasePointerCapture
        // These are polyfilled in jest.setup.ts, so we can spy on them safely
        setCaptureSpy = jest.spyOn(Element.prototype, 'setPointerCapture');
        releaseCaptureSpy = jest.spyOn(Element.prototype, 'releasePointerCapture');
        hasCaptureSpy = jest.spyOn(Element.prototype, 'hasPointerCapture').mockReturnValue(true);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('verifies getBoundingClientRect is NOT called during pointer move (optimized behavior)', () => {
        render(<Canvas data-testid="canvas" />);
        const canvas = screen.getByTestId('canvas');

        // Spy on getBoundingClientRect
        const spy = jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
            left: 0, top: 0, right: 500, bottom: 500,
            width: 500, height: 500, x: 0, y: 0, toJSON: () => { }
        });

        // With jest.setup.ts polyfill, we can pass offsetX/offsetY in options
        // Note: fireEvent calls the global PointerEvent constructor we polyfilled
        fireEvent.pointerDown(canvas, {
            clientX: 100, clientY: 100,
            target: canvas,
            offsetX: 100, offsetY: 100
        });

        fireEvent.pointerMove(canvas, {
            clientX: 200, clientY: 200,
            offsetX: 200, offsetY: 200
        });

        // Assert it is NOT called
        expect(spy).not.toHaveBeenCalled();
    });
});
