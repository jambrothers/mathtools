import { numberLineSerializer } from './url-state';

describe('Number Line URL State', () => {
    it('should serialize and deserialize a basic state', () => {
        const state = {
            min: -10,
            max: 10,
            points: [
                { id: 'p-1', value: 3, label: 'A', color: 'red' },
                { id: 'p-2', value: -5, label: 'B', color: 'blue' }
            ],
            arcs: [
                { fromId: 'p-2', toId: 'p-1', label: '+8' }
            ],
            showLabels: true,
            hideValues: false,
            snapToTicks: true
        };

        const params = numberLineSerializer.serialize(state);
        const deserialized = numberLineSerializer.deserialize(params);

        expect(deserialized).toEqual(state);
    });

    it('should handle missing and malformed params with defaults', () => {
        const params = new URLSearchParams('min=abc&max=xyz&points=garbage');
        const deserialized = numberLineSerializer.deserialize(params);

        expect(deserialized.min).toBe(-10);
        expect(deserialized.max).toBe(10);
        expect(deserialized.points).toEqual([]);
        expect(deserialized.arcs).toEqual([]);
        expect(deserialized.showLabels).toBe(true);
    });

    it('should serialize empty points and arcs correctly', () => {
        const state = {
            min: 0,
            max: 100,
            points: [],
            arcs: [],
            showLabels: false,
            hideValues: true,
            snapToTicks: false
        };

        const params = numberLineSerializer.serialize(state);
        const deserialized = numberLineSerializer.deserialize(params);

        expect(deserialized).toEqual(state);
    });
});
