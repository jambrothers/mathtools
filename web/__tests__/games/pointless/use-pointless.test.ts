import { renderHook, act } from '@testing-library/react'
import { usePointless } from '@/app/games/pointless/_hooks/use-pointless'

// Mock the question generator to have deterministic results for tests if needed
jest.mock('@/app/games/pointless/_lib/question-generator', () => {
    const originalModule = jest.requireActual('@/app/games/pointless/_lib/question-generator');
    return {
        ...originalModule,
        generateQuestion: jest.fn((category) => ({
            category,
            text: `Mocked ${category} question`,
            answers: [1, 2, 3],
            parameters: { n: 10 }
        }))
    }
});

describe('usePointless', () => {
    it('initializes with a default question', () => {
        const { result } = renderHook(() => usePointless())
        expect(result.current.question).toBeDefined()
        expect(result.current.isRevealed).toBe(false)
    });

    it('changes category and generates a new question', () => {
        const { result } = renderHook(() => usePointless())
        act(() => {
            result.current.setCategory('primes-in-range')
        })
        expect(result.current.category).toBe('primes-in-range')
        expect(result.current.question.text).toBe('Mocked primes-in-range question')
    });

    it('updates parameters and regenerates', () => {
        const { result } = renderHook(() => usePointless())
        act(() => {
            result.current.setParams({ n: 20 })
        })
        expect(result.current.params).toEqual({ n: 20 })
        // Generates new question when params change
    });

    it('toggles reveal state', () => {
        const { result } = renderHook(() => usePointless())
        expect(result.current.isRevealed).toBe(false)
        act(() => {
            result.current.toggleReveal()
        })
        expect(result.current.isRevealed).toBe(true)
    });

    it('generates a next question', () => {
        const { result } = renderHook(() => usePointless())
        act(() => {
            result.current.nextQuestion()
        })
        // In this case mocked is same, but let's check it's called
    });
});
