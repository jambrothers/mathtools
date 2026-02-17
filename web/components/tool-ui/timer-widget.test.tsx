import { render, screen, act, fireEvent } from '@testing-library/react'
import { TimerWidget } from './timer-widget'

describe('TimerWidget Performance', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('should not constantly clear and recreate the interval while running', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
    const setIntervalSpy = jest.spyOn(global, 'setInterval')

    render(<TimerWidget />)

    // Set 30s preset
    const button30s = screen.getByText('30s')
    fireEvent.click(button30s)

    // Verify start time
    expect(screen.getByText('00:30')).toBeInTheDocument()

    // Start timer
    const startButton = screen.getByLabelText('Start')
    fireEvent.click(startButton)

    // Reset spy counts after initial start
    clearIntervalSpy.mockClear()
    setIntervalSpy.mockClear()

    // Advance 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000)
    })

    // Functional check: Timer should have counted down
    expect(screen.getByText('00:27')).toBeInTheDocument()

    // Performance check: clearInterval should NOT be called during active countdown
    expect(clearIntervalSpy).toHaveBeenCalledTimes(0)
    expect(setIntervalSpy).toHaveBeenCalledTimes(0)

    // Advance to completion (remaining 27s)
    act(() => {
      jest.advanceTimersByTime(27000)
    })

    // Functional check: Timer should stop at 00:00
    expect(screen.getByText('00:00')).toBeInTheDocument()

    // Performance check: clearInterval should be called ONCE when timer stops (isRunning -> false)
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1)
  })
})
