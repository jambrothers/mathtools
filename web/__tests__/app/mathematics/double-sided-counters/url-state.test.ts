import {
    serializeCounters,
    parseCounterString,
    counterURLSerializer,
    CounterURLState,
} from '@/app/mathematics/double-sided-counters/_lib/url-state';
import { Counter, CounterType } from '@/app/mathematics/double-sided-counters/_hooks/use-counters';

describe('Counter URL State', () => {
    describe('serializeCounters', () => {
        it('returns empty string for empty array', () => {
            expect(serializeCounters([])).toBe('');
        });

        it('serializes single positive counter', () => {
            const counters: Counter[] = [
                { id: 0, value: 1, x: 32, y: 32 }
            ];
            expect(serializeCounters(counters)).toBe('p:32,32');
        });

        it('serializes single negative counter', () => {
            const counters: Counter[] = [
                { id: 0, value: -1, x: 100, y: 200 }
            ];
            expect(serializeCounters(counters)).toBe('n:100,200');
        });

        it('serializes multiple counters', () => {
            const counters: Counter[] = [
                { id: 0, value: 1, x: 32, y: 32 },
                { id: 1, value: 1, x: 128, y: 32 },
                { id: 2, value: -1, x: 224, y: 32 }
            ];
            expect(serializeCounters(counters)).toBe('p:32,32;p:128,32;n:224,32');
        });

        it('rounds float positions to integers', () => {
            const counters: Counter[] = [
                { id: 0, value: 1, x: 32.7, y: 32.3 }
            ];
            expect(serializeCounters(counters)).toBe('p:33,32');
        });
    });

    describe('parseCounterString', () => {
        it('returns empty array for empty string', () => {
            expect(parseCounterString('')).toEqual([]);
        });

        it('returns empty array for null/undefined', () => {
            expect(parseCounterString(null as unknown as string)).toEqual([]);
        });

        it('parses single positive counter', () => {
            const result = parseCounterString('p:32,32');
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({ id: 0, value: 1, x: 32, y: 32 });
        });

        it('parses single negative counter', () => {
            const result = parseCounterString('n:100,200');
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({ id: 0, value: -1, x: 100, y: 200 });
        });

        it('parses multiple counters with sequential IDs', () => {
            const result = parseCounterString('p:32,32;p:128,32;n:224,32');
            expect(result).toHaveLength(3);
            expect(result[0]).toEqual({ id: 0, value: 1, x: 32, y: 32 });
            expect(result[1]).toEqual({ id: 1, value: 1, x: 128, y: 32 });
            expect(result[2]).toEqual({ id: 2, value: -1, x: 224, y: 32 });
        });

        it('handles negative coordinates', () => {
            const result = parseCounterString('p:-50,-100');
            expect(result[0]).toEqual({ id: 0, value: 1, x: -50, y: -100 });
        });

        it('ignores invalid entries', () => {
            const result = parseCounterString('p:32,32;invalid;n:100,200');
            expect(result).toHaveLength(2);
        });

        it('handles whitespace', () => {
            const result = parseCounterString(' p:32,32 ; n:100,200 ');
            expect(result).toHaveLength(2);
        });
    });

    describe('roundtrip serialization', () => {
        it('preserves counter data through serialize/parse', () => {
            const original: Counter[] = [
                { id: 0, value: 1, x: 32, y: 32 },
                { id: 1, value: -1, x: 128, y: 64 },
                { id: 2, value: 1, x: 224, y: 96 },
            ];

            const serialized = serializeCounters(original);
            const parsed = parseCounterString(serialized);

            expect(parsed).toHaveLength(original.length);
            for (let i = 0; i < original.length; i++) {
                expect(parsed[i].value).toBe(original[i].value);
                expect(parsed[i].x).toBe(original[i].x);
                expect(parsed[i].y).toBe(original[i].y);
            }
        });
    });

    describe('counterURLSerializer', () => {
        const defaultState: CounterURLState = {
            counters: [],
            sortState: 'none',
            isOrdered: true,
            isSequentialMode: false,
            animSpeed: 1000,
            showNumberLine: false,
            showStats: true,
            counterType: 'numeric',
        };

        describe('serialize', () => {
            it('serializes empty state', () => {
                const params = counterURLSerializer.serialize(defaultState);
                expect(params.has('c')).toBe(false); // No counters param
                expect(params.get('nl')).toBe('0');
                expect(params.get('st')).toBe('1');
                expect(params.get('sl')).toBe('0');
                expect(params.get('or')).toBe('1');
                expect(params.get('so')).toBe('none');
            });

            it('includes counters when present', () => {
                const state: CounterURLState = {
                    ...defaultState,
                    counters: [{ id: 0, value: 1, x: 32, y: 32 }]
                };
                const params = counterURLSerializer.serialize(state);
                expect(params.get('c')).toBe('p:32,32');
            });

            it('includes speed only when slow mode is on', () => {
                const fastState = counterURLSerializer.serialize(defaultState);
                expect(fastState.has('sp')).toBe(false);

                const slowState = counterURLSerializer.serialize({
                    ...defaultState,
                    isSequentialMode: true,
                    animSpeed: 500
                });
                expect(slowState.get('sp')).toBe('500');
            });

            it('serializes all settings', () => {
                const state: CounterURLState = {
                    counters: [{ id: 0, value: -1, x: 100, y: 200 }],
                    sortState: 'grouped',
                    isOrdered: false,
                    isSequentialMode: true,
                    animSpeed: 2000,
                    showNumberLine: true,
                    showStats: false,
                    counterType: 'numeric',
                };
                const params = counterURLSerializer.serialize(state);

                expect(params.get('c')).toBe('n:100,200');
                expect(params.get('nl')).toBe('1');
                expect(params.get('st')).toBe('0');
                expect(params.get('sl')).toBe('1');
                expect(params.get('sp')).toBe('2000');
                expect(params.get('so')).toBe('grouped');
                expect(params.get('or')).toBe('0');
            });
        });

        describe('deserialize', () => {
            it('returns null when no relevant params', () => {
                const params = new URLSearchParams();
                expect(counterURLSerializer.deserialize(params)).toBeNull();
            });

            it('deserializes with defaults for missing params', () => {
                const params = new URLSearchParams();
                params.set('nl', '1'); // Just one param to trigger deserialization

                const result = counterURLSerializer.deserialize(params);
                expect(result).not.toBeNull();
                expect(result!.counters).toEqual([]);
                expect(result!.showNumberLine).toBe(true);
                expect(result!.showStats).toBe(true); // default
                expect(result!.isSequentialMode).toBe(false); // default
                expect(result!.animSpeed).toBe(1000); // default
                expect(result!.sortState).toBe('none'); // default
                expect(result!.isOrdered).toBe(true); // default
            });

            it('deserializes all params', () => {
                const params = new URLSearchParams();
                params.set('c', 'p:32,32;n:128,64');
                params.set('nl', '1');
                params.set('st', '0');
                params.set('sl', '1');
                params.set('sp', '500');
                params.set('so', 'paired');
                params.set('or', '0');

                const result = counterURLSerializer.deserialize(params);
                expect(result).not.toBeNull();
                expect(result!.counters).toHaveLength(2);
                expect(result!.showNumberLine).toBe(true);
                expect(result!.showStats).toBe(false);
                expect(result!.isSequentialMode).toBe(true);
                expect(result!.animSpeed).toBe(500);
                expect(result!.sortState).toBe('paired');
                expect(result!.isOrdered).toBe(false);
            });

            it('handles invalid sort state gracefully', () => {
                const params = new URLSearchParams();
                params.set('so', 'invalid');

                const result = counterURLSerializer.deserialize(params);
                expect(result!.sortState).toBe('none');
            });
        });

        describe('roundtrip', () => {
            it('preserves full state through serialize/deserialize', () => {
                const original: CounterURLState = {
                    counters: [
                        { id: 0, value: 1, x: 32, y: 32 },
                        { id: 1, value: -1, x: 128, y: 64 },
                    ],
                    sortState: 'grouped',
                    isOrdered: false,
                    isSequentialMode: true,
                    animSpeed: 750,
                    showNumberLine: true,
                    showStats: false,
                    counterType: 'numeric',
                };

                const params = counterURLSerializer.serialize(original);
                const restored = counterURLSerializer.deserialize(params);

                expect(restored).not.toBeNull();
                expect(restored!.counters).toHaveLength(original.counters.length);
                expect(restored!.sortState).toBe(original.sortState);
                expect(restored!.isOrdered).toBe(original.isOrdered);
                expect(restored!.isSequentialMode).toBe(original.isSequentialMode);
                expect(restored!.animSpeed).toBe(original.animSpeed);
                expect(restored!.showNumberLine).toBe(original.showNumberLine);
                expect(restored!.showStats).toBe(original.showStats);
                expect(restored!.counterType).toBe(original.counterType);

                // Counter values and positions should match
                for (let i = 0; i < original.counters.length; i++) {
                    expect(restored!.counters[i].value).toBe(original.counters[i].value);
                    expect(restored!.counters[i].x).toBe(original.counters[i].x);
                    expect(restored!.counters[i].y).toBe(original.counters[i].y);
                }
            });
        });

        describe('counterType', () => {
            it('serializes numeric counter type by omitting ct param', () => {
                const state: CounterURLState = {
                    ...defaultState,
                    counterType: 'numeric',
                };
                const params = counterURLSerializer.serialize(state);
                // Numeric is default, so ct param should be omitted for cleaner URLs
                expect(params.has('ct')).toBe(false);
            });

            it('serializes variable counter types with ct param', () => {
                const types: CounterType[] = ['x', 'y', 'z', 'a', 'b', 'c'];
                for (const counterType of types) {
                    const state: CounterURLState = {
                        ...defaultState,
                        counterType,
                    };
                    const params = counterURLSerializer.serialize(state);
                    expect(params.get('ct')).toBe(counterType);
                }
            });

            it('deserializes missing ct param as numeric (backwards compatibility)', () => {
                const params = new URLSearchParams();
                params.set('nl', '0'); // Just one param to trigger deserialization

                const result = counterURLSerializer.deserialize(params);
                expect(result).not.toBeNull();
                expect(result!.counterType).toBe('numeric');
            });

            it('deserializes valid counter types', () => {
                const types: CounterType[] = ['x', 'y', 'z', 'a', 'b', 'c'];
                for (const counterType of types) {
                    const params = new URLSearchParams();
                    params.set('ct', counterType);

                    const result = counterURLSerializer.deserialize(params);
                    expect(result).not.toBeNull();
                    expect(result!.counterType).toBe(counterType);
                }
            });

            it('defaults invalid counter type to numeric', () => {
                const params = new URLSearchParams();
                params.set('ct', 'invalid');

                const result = counterURLSerializer.deserialize(params);
                expect(result!.counterType).toBe('numeric');
            });

            it('roundtrips counter type through serialize/deserialize', () => {
                const state: CounterURLState = {
                    ...defaultState,
                    counterType: 'x',
                    counters: [{ id: 0, value: 1, x: 32, y: 32 }],
                };

                const params = counterURLSerializer.serialize(state);
                const restored = counterURLSerializer.deserialize(params);

                expect(restored!.counterType).toBe('x');
            });
        });
    });
});
