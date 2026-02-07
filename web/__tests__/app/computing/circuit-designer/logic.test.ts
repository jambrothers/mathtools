import { COMPONENT_TYPES } from '@/app/computing/circuit-designer/constants';

describe('Circuit Designer Logic', () => {
    describe('INPUT Component', () => {
        const component = COMPONENT_TYPES.INPUT;

        it('should return state when provided', () => {
            expect(component.evaluate([], true)).toBe(true);
            expect(component.evaluate([], false)).toBe(false);
        });

        it('should default to false if state is undefined', () => {
            expect(component.evaluate([], undefined)).toBe(false);
        });

        it('should ignore inputs', () => {
            expect(component.evaluate([true, true], false)).toBe(false);
        });
    });

    describe('OUTPUT Component', () => {
        const component = COMPONENT_TYPES.OUTPUT;

        it('should reflect input value', () => {
            expect(component.evaluate([true])).toBe(true);
            expect(component.evaluate([false])).toBe(false);
        });

        it('should default to false if no input', () => {
            expect(component.evaluate([])).toBe(false);
        });
    });

    describe('AND Component', () => {
        const component = COMPONENT_TYPES.AND;

        it('should be true only if both inputs are true', () => {
            expect(component.evaluate([false, false])).toBe(false);
            expect(component.evaluate([true, false])).toBe(false);
            expect(component.evaluate([false, true])).toBe(false);
            expect(component.evaluate([true, true])).toBe(true);
        });
    });

    describe('OR Component', () => {
        const component = COMPONENT_TYPES.OR;

        it('should be true if at least one input is true', () => {
            expect(component.evaluate([false, false])).toBe(false);
            expect(component.evaluate([true, false])).toBe(true);
            expect(component.evaluate([false, true])).toBe(true);
            expect(component.evaluate([true, true])).toBe(true);
        });
    });

    describe('NOT Component', () => {
        const component = COMPONENT_TYPES.NOT;

        it('should invert the input', () => {
            expect(component.evaluate([true])).toBe(false);
            expect(component.evaluate([false])).toBe(true);
        });
    });

    describe('XOR Component', () => {
        const component = COMPONENT_TYPES.XOR;

        it('should be true if inputs are different', () => {
            expect(component.evaluate([false, false])).toBe(false);
            expect(component.evaluate([true, false])).toBe(true);
            expect(component.evaluate([false, true])).toBe(true);
            expect(component.evaluate([true, true])).toBe(false);
        });
    });
});
