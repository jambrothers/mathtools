import {
    serializeBool,
    deserializeBool,
    serializeNumber,
    deserializeNumber,
    deserializeString,
    generateShareableURL,
    URLStateSerializer,
} from '@/lib/url-state';

describe('URL State Utilities', () => {
    describe('serializeBool / deserializeBool', () => {
        it('serializes true to "1"', () => {
            expect(serializeBool(true)).toBe('1');
        });

        it('serializes false to "0"', () => {
            expect(serializeBool(false)).toBe('0');
        });

        it('deserializes "1" to true', () => {
            expect(deserializeBool('1')).toBe(true);
        });

        it('deserializes "0" to false', () => {
            expect(deserializeBool('0')).toBe(false);
        });

        it('uses default value when null', () => {
            expect(deserializeBool(null)).toBe(false);
            expect(deserializeBool(null, true)).toBe(true);
            expect(deserializeBool(null, false)).toBe(false);
        });

        it('treats non-"1" values as false', () => {
            expect(deserializeBool('yes')).toBe(false);
            expect(deserializeBool('true')).toBe(false);
            expect(deserializeBool('')).toBe(false);
        });
    });

    describe('serializeNumber / deserializeNumber', () => {
        it('serializes integers', () => {
            expect(serializeNumber(42)).toBe('42');
            expect(serializeNumber(0)).toBe('0');
            expect(serializeNumber(-10)).toBe('-10');
        });

        it('serializes floats', () => {
            expect(serializeNumber(3.14)).toBe('3.14');
        });

        it('deserializes valid number strings', () => {
            expect(deserializeNumber('42')).toBe(42);
            expect(deserializeNumber('0')).toBe(0);
            expect(deserializeNumber('-10')).toBe(-10);
            expect(deserializeNumber('3.14')).toBe(3.14);
        });

        it('uses default value when null', () => {
            expect(deserializeNumber(null)).toBe(0);
            expect(deserializeNumber(null, 100)).toBe(100);
        });

        it('uses default value for invalid strings', () => {
            expect(deserializeNumber('abc')).toBe(0);
            expect(deserializeNumber('abc', 50)).toBe(50);
            expect(deserializeNumber('')).toBe(0);
        });
    });

    describe('deserializeString', () => {
        it('returns the value when present', () => {
            expect(deserializeString('hello', 'default')).toBe('hello');
            expect(deserializeString('', 'default')).toBe('');
        });

        it('returns default when null', () => {
            expect(deserializeString(null, 'default')).toBe('default');
        });
    });

    describe('generateShareableURL', () => {
        const mockSerializer: URLStateSerializer<{ name: string; count: number }> = {
            serialize: (state) => {
                const params = new URLSearchParams();
                params.set('name', state.name);
                params.set('count', String(state.count));
                return params;
            },
            deserialize: (params) => {
                const name = params.get('name');
                const count = params.get('count');
                if (!name || !count) return null;
                return { name, count: Number(count) };
            }
        };

        it('generates URL with serialized params', () => {
            const url = generateShareableURL(
                mockSerializer,
                { name: 'test', count: 5 },
                'http://example.com/page'
            );
            expect(url).toBe('http://example.com/page?name=test&count=5');
        });

        it('handles empty state', () => {
            const emptySerializer: URLStateSerializer<object> = {
                serialize: () => new URLSearchParams(),
                deserialize: () => ({})
            };
            const url = generateShareableURL(emptySerializer, {}, 'http://example.com/page');
            expect(url).toBe('http://example.com/page');
        });
    });
});
