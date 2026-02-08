
import { computeRelativeLabel } from './compute-relative-label';

describe('computeRelativeLabel', () => {
    // Basic Functionality (existing behavior)
    it('should calculate basic fraction when no format specified', () => {
        expect(computeRelativeLabel(50, 100, '100%')).toBe('50%'); // Default match total
        expect(computeRelativeLabel(50, 100, 'Total')).toBe('Total/2');
    });

    // Fraction Format
    it('should format as fraction', () => {
        expect(computeRelativeLabel(50, 100, '100%', 'fraction')).toBe('1/2');
        expect(computeRelativeLabel(20, 100, '100%', 'fraction')).toBe('1/5');
        expect(computeRelativeLabel(75, 100, '100%', 'fraction')).toBe('3/4');
        expect(computeRelativeLabel(100, 100, '100%', 'fraction')).toBe('1');
        expect(computeRelativeLabel(33.33, 100, '100%', 'fraction')).toBe('33/100'); // Approx
    });

    // Decimal Format
    it('should format as decimal', () => {
        expect(computeRelativeLabel(50, 100, '100%', 'decimal')).toBe('0.5');
        expect(computeRelativeLabel(20, 100, '100%', 'decimal')).toBe('0.2');
        expect(computeRelativeLabel(75, 100, '100%', 'decimal')).toBe('0.75');
        expect(computeRelativeLabel(100, 100, '100%', 'decimal')).toBe('1');
        expect(computeRelativeLabel(33.3333, 100, '100%', 'decimal')).toBe('0.33');
    });

    // Percentage Format
    it('should format as percentage', () => {
        expect(computeRelativeLabel(50, 100, '100', 'percentage')).toBe('50%');
        expect(computeRelativeLabel(20, 100, 'Any', 'percentage')).toBe('20%');
        expect(computeRelativeLabel(75, 100, 'Total', 'percentage')).toBe('75%');
        expect(computeRelativeLabel(100, 100, '100', 'percentage')).toBe('100%');
        expect(computeRelativeLabel(33.3333, 100, '100', 'percentage')).toBe('33.3%');
    });

    // Match Total (Default)
    it('should default to match total format', () => {
        expect(computeRelativeLabel(50, 100, '100%', 'total')).toBe('50%');
        expect(computeRelativeLabel(50, 100, '100', 'total')).toBe('50');
        expect(computeRelativeLabel(50, 100, 'Total', 'total')).toBe('Total/2');
    });

    // Edge Cases
    it('should handle zero width', () => {
        expect(computeRelativeLabel(0, 100, '100%', 'fraction')).toBe('0');
        expect(computeRelativeLabel(0, 100, '100%', 'decimal')).toBe('0');
        expect(computeRelativeLabel(0, 100, '100%', 'percentage')).toBe('0%');
    });
});
