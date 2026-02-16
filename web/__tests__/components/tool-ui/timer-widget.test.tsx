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
        expect(screen.getByRole('timer')).toBeInTheDocument()
    })

    it('sets correct time when preset button is clicked', () => {
        render(<TimerWidget />)
        const btn1m = screen.getByRole('button', { name: /1 minute/i })
        fireEvent.click(btn1m)
        expect(screen.getByText('01:00')).toBeInTheDocument()
    })

    it('counts down when started', () => {
        render(<TimerWidget />)
        // Set to 1m
        fireEvent.click(screen.getByRole('button', { name: /1 minute/i }))

        // Start
        const startBtn = screen.getByRole('button', { name: /start timer/i })
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
        fireEvent.click(screen.getByRole('button', { name: /1 minute/i }))

        const startBtn = screen.getByRole('button', { name: /start timer/i })
        fireEvent.click(startBtn)

        act(() => {
            jest.advanceTimersByTime(1000)
        })
        expect(screen.getByText('00:59')).toBeInTheDocument()

        // Stop (should toggle to pause/stop)
        const stopBtn = screen.getByRole('button', { name: /pause timer/i })
        fireEvent.click(stopBtn)

        act(() => {
            jest.advanceTimersByTime(1000)
        })
        expect(screen.getByText('00:59')).toBeInTheDocument()
    })

    it('resets time to 00:00 when reset is clicked', () => {
        render(<TimerWidget />)
        fireEvent.click(screen.getByRole('button', { name: /1 minute/i }))
        expect(screen.getByText('01:00')).toBeInTheDocument()

        const resetBtn = screen.getByRole('button', { name: /reset timer/i })
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
        fireEvent.click(screen.getByRole('button', { name: /30 seconds/i }))
        fireEvent.click(screen.getByRole('button', { name: /start timer/i }))

        act(() => {
            jest.advanceTimersByTime(40000)
        })
        expect(screen.getByText('00:00')).toBeInTheDocument()
    })

    it('shows visual feedback and alert when timer completes', () => {
        render(<TimerWidget />)
        fireEvent.click(screen.getByRole('button', { name: /30 seconds/i }))
        fireEvent.click(screen.getByRole('button', { name: /start timer/i }))

        act(() => {
            jest.advanceTimersByTime(31000)
        })

        // Check for alert
        expect(screen.getByRole('alert')).toHaveTextContent(/timer finished/i)

        // Check for visual class on timer display
        const timerDisplay = screen.getByRole('timer')
        expect(timerDisplay).toHaveClass('text-red-600')
    })
})
