import { render, screen, act, fireEvent } from '@testing-library/react'
import { TimerWidget } from '@/components/tool-ui/timer-widget'

describe('TimerWidget', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('renders with initial time of 00:00 and role="timer"', () => {
        render(<TimerWidget />)
        const timerDisplay = screen.getByRole('timer')
        expect(timerDisplay).toBeInTheDocument()
        expect(timerDisplay).toHaveTextContent('00:00')
    })

    it('sets correct time when preset button is clicked', () => {
        render(<TimerWidget />)
        const btn1m = screen.getByRole('button', { name: /set timer to 1 minute/i })
        fireEvent.click(btn1m)
        expect(screen.getByRole('timer')).toHaveTextContent('01:00')
    })

    it('counts down when started', () => {
        render(<TimerWidget />)
        // Set to 1m
        fireEvent.click(screen.getByRole('button', { name: /set timer to 1 minute/i }))

        // Start
        const startBtn = screen.getByRole('button', { name: /start/i })
        fireEvent.click(startBtn)

        act(() => {
            jest.advanceTimersByTime(1000)
        })
        expect(screen.getByRole('timer')).toHaveTextContent('00:59')

        act(() => {
            jest.advanceTimersByTime(59000)
        })
        expect(screen.getByRole('timer')).toHaveTextContent('00:00')
    })

    it('shows visual feedback and announces status when timer finishes', () => {
        render(<TimerWidget />)
        // Set to 30s for a shorter test
        fireEvent.click(screen.getByRole('button', { name: /set timer to 30 seconds/i }))
        fireEvent.click(screen.getByRole('button', { name: /start/i }))

        // Advance to finish
        act(() => {
            jest.advanceTimersByTime(30000) // 30s
        })

        // Check for finish state
        expect(screen.getByRole('timer')).toHaveTextContent('00:00')
        expect(screen.getByRole('timer')).toHaveClass('text-red-600')
        expect(screen.getByRole('timer')).toHaveClass('animate-pulse')

        // Check for status announcement
        expect(screen.getByRole('status')).toHaveTextContent('Timer finished')
    })

    it('clears finish state on reset', () => {
        render(<TimerWidget />)
        // Finish the timer
        fireEvent.click(screen.getByRole('button', { name: /set timer to 30 seconds/i }))
        fireEvent.click(screen.getByRole('button', { name: /start/i }))
        act(() => {
            jest.advanceTimersByTime(30000)
        })

        expect(screen.getByRole('timer')).toHaveClass('text-red-600')

        // Reset
        fireEvent.click(screen.getByRole('button', { name: /reset/i }))

        expect(screen.getByRole('timer')).not.toHaveClass('text-red-600')
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('clears finish state on start', () => {
        render(<TimerWidget />)
        // Finish the timer
        fireEvent.click(screen.getByRole('button', { name: /set timer to 30 seconds/i }))
        fireEvent.click(screen.getByRole('button', { name: /start/i }))
        act(() => {
            jest.advanceTimersByTime(30000)
        })

        expect(screen.getByRole('timer')).toHaveClass('text-red-600')

        // Set new time and Start again
        fireEvent.click(screen.getByRole('button', { name: /set timer to 30 seconds/i }))
        fireEvent.click(screen.getByRole('button', { name: /start/i }))

        expect(screen.getByRole('timer')).not.toHaveClass('text-red-600')
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('stops counting when stopped', () => {
        render(<TimerWidget />)
        fireEvent.click(screen.getByRole('button', { name: /set timer to 1 minute/i }))

        const startBtn = screen.getByRole('button', { name: /start/i })
        fireEvent.click(startBtn)

        act(() => {
            jest.advanceTimersByTime(1000)
        })
        expect(screen.getByRole('timer')).toHaveTextContent('00:59')

        // Stop (should toggle to pause/stop)
        const stopBtn = screen.getByRole('button', { name: /pause/i })
        fireEvent.click(stopBtn)

        act(() => {
            jest.advanceTimersByTime(1000)
        })
        expect(screen.getByRole('timer')).toHaveTextContent('00:59')
    })

    it('does not go below 00:00', () => {
        render(<TimerWidget />)
        fireEvent.click(screen.getByRole('button', { name: /set timer to 30 seconds/i }))
        fireEvent.click(screen.getByRole('button', { name: /start/i }))

        act(() => {
            jest.advanceTimersByTime(40000)
        })
        expect(screen.getByRole('timer')).toHaveTextContent('00:00')
    })
})
