import { linearEquationsSerializer } from './url-state';
import { LINE_COLORS } from '../constants';

describe('Linear Equations URL State', () => {
    it('serializes default state correctly', () => {
        const state = {
            lines: [{ id: 'line-1', m: 0.5, c: 1, color: 'blue', visible: true }],
            activeLineId: 'line-1',
            showEquation: true,
            showIntercepts: true,
            showSlopeTriangle: true,
            slopeTriangleSize: 1,
            showGradientCalculation: true,
            showGrid: true
        };

        const params = linearEquationsSerializer.serialize(state);

        expect(params.get('lines')).toBe('0.5,1');
        expect(params.get('eq')).toBe('1');
        expect(params.get('int')).toBe('1');
    });

    it('serializes multiple lines', () => {
        const state = {
            lines: [
                { id: 'line-1', m: 1, c: 0, color: 'blue', visible: true },
                { id: 'line-2', m: -2, c: 3, color: 'red', visible: true }
            ],
            activeLineId: 'line-2',
            showEquation: false,
            showIntercepts: false,
            showSlopeTriangle: false,
            slopeTriangleSize: 1,
            showGradientCalculation: false,
            showGrid: false
        };

        const params = linearEquationsSerializer.serialize(state);

        expect(params.get('lines')).toBe('1,0|-2,3');
        expect(params.get('active')).toBe('line-2');
        expect(params.get('eq')).toBe('0');
    });

    it('deserializes minimal params to default', () => {
        const params = new URLSearchParams();
        const state = linearEquationsSerializer.deserialize(params);

        expect(state?.lines).toHaveLength(1);
        expect(state?.lines[0].m).toBe(0.5); // Defaults from constant
        expect(state?.showGrid).toBe(true);
    });

    it('deserializes multi-line string', () => {
        const params = new URLSearchParams([['lines', '1,0|-2,3']]);
        const state = linearEquationsSerializer.deserialize(params);

        expect(state?.lines).toHaveLength(2);
        expect(state?.lines[0]).toMatchObject({ m: 1, c: 0 });
        expect(state?.lines[1]).toMatchObject({ m: -2, c: 3 });

        // Colors should be assigned deterministically
        expect(state?.lines[0].color).toBe(LINE_COLORS[0]);
        expect(state?.lines[1].color).toBe(LINE_COLORS[1]);
    });

    it('limits the number of lines parsed (security check)', () => {
        // Create a string with 25 lines (MAX_LINES is 20)
        const linesStr = Array(25).fill('1,1').join('|');
        const params = new URLSearchParams([['lines', linesStr]]);
        const state = linearEquationsSerializer.deserialize(params);

        // Should be limited to 20
        expect(state?.lines).toHaveLength(20);
        // IDs should be line-1 to line-20
        expect(state?.lines[19].id).toBe('line-20');
    });

    it('skips empty line segments', () => {
        const params = new URLSearchParams([['lines', '1,0||-2,3']]);
        const state = linearEquationsSerializer.deserialize(params);

        expect(state?.lines).toHaveLength(2);
        expect(state?.lines[0].m).toBe(1);
        expect(state?.lines[1].m).toBe(-2);
        expect(state?.lines[0].id).toBe('line-1');
        expect(state?.lines[1].id).toBe('line-2');
    });
});
