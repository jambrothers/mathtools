import { render, screen, fireEvent } from '@testing-library/react'
import { SpeedControl } from '@/components/tool-ui/speed-control'

describe('SpeedControl', () => {
    test.each([
        [1100, '50'], // Mid
        [200, '100'], // Min (Fastest)
        [2000, '0']   // Max (Slowest)
    ])('renders correct slider value for speed %i', (speed, expected) => {
        render(<SpeedControl speed={speed} onChange={jest.fn()} />)
        expect(screen.getByRole('slider')).toHaveValue(expected)
    })

    it('calls onChange with correct value when slider changes', () => {
        const onChange = jest.fn()
        render(<SpeedControl speed={1100} onChange={onChange} />)
        // Slider 75 -> Speed 650 (inverted logic)
        fireEvent.change(screen.getByRole('slider'), { target: { value: '75' } })
        expect(onChange).toHaveBeenCalledWith(650)
    })

    it('handles custom min/max props', () => {
        const onChange = jest.fn()
        render(<SpeedControl speed={300} min={100} max={500} onChange={onChange} />)
        const input = screen.getByRole('slider')
        expect(input).toHaveValue('50')
        // Slider 25 -> Speed 400
        fireEvent.change(input, { target: { value: '25' } })
        expect(onChange).toHaveBeenCalledWith(400)
    })
})
