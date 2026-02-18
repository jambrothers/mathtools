import { render, screen, act, fireEvent } from '@testing-library/react'
import { TimerWidget } from '@/components/tool-ui/timer-widget'

describe('TimerWidget', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('renders with initial time of 00:00', () => {
        render(<TimerWidget />)
        expect(screen.getByText('00:00')).toBeInTheDocument()
    })

    it('sets correct time when preset button is clicked', () => {
        render(<TimerWidget />)
        const btn1m = screen.getByRole('button', { name: /1m/i })
        fireEvent.click(btn1m)
        expect(screen.getByText('01:00')).toBeInTheDocument()
    })

    it('counts down when started', () => {
        render(<TimerWidget />)
        // Set to 1m
        fireEvent.click(screen.getByRole('button', { name: /1m/i }))
        fireEvent.click(screen.getByRole('button', { name: /1m/i }))

        // Start
        const startBtn = screen.getByRole('button', { name: /start/i })
        fireEvent.click(startBtn)

        act(() => {
            jest.advanceTimersByTime(1000)
        })
        expect(screen.getByText('00:59')).toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(59000)
        })
        expect(screen.getByText('00:00')).toBeInTheDocument()
    })

    it('stops counting when stopped', () => {
        render(<TimerWidget />)
        fireEvent.click(screen.getByRole('button', { name: /1m/i }))

        const startBtn = screen.getByRole('button', { name: /start/i })
        fireEvent.click(startBtn)

        act(() => {
            jest.advanceTimersByTime(1000)
        })
        expect(screen.getByText('00:59')).toBeInTheDocument()

        // Stop (should toggle to pause/stop)
        const stopBtn = screen.getByRole('button', { name: /pause/i })
        fireEvent.click(stopBtn)

        act(() => {
            jest.advanceTimersByTime(1000)
        })
        expect(screen.getByText('00:59')).toBeInTheDocument()
    })

    it('resets time to 00:00 when reset is clicked', () => {
        render(<TimerWidget />)
        fireEvent.click(screen.getByRole('button', { name: /1m/i }))
        expect(screen.getByText('01:00')).toBeInTheDocument()

        const resetBtn = screen.getByRole('button', { name: /reset/i })
        fireEvent.click(resetBtn)
        expect(screen.getByText('00:00')).toBeInTheDocument()

        // Ensure it's not running
        act(() => {
            jest.advanceTimersByTime(1000)
        })
        expect(screen.getByText('00:00')).toBeInTheDocument()
    })

    it('does not go below 00:00', () => {
        render(<TimerWidget />)
        fireEvent.click(screen.getByRole('button', { name: /30s/i }))
        fireEvent.click(screen.getByRole('button', { name: /start/i }))

        act(() => {
            jest.advanceTimersByTime(40000)
        })
        expect(screen.getByText('00:00')).toBeInTheDocument()
    })
})
