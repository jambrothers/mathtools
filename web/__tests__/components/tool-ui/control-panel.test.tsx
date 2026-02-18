import { render, screen, fireEvent } from '@testing-library/react'
import { ControlSlider, ControlSection, ControlToggle, ControlPresetButton } from '@/components/tool-ui/control-panel'
import '@testing-library/jest-dom'

describe('ControlPanel Components', () => {
    describe('ControlSlider', () => {
        it('renders with label and value', () => {
            render(
                <ControlSlider
                    label="Test Slider"
                    value={5}
                    min={0}
                    max={10}
                    onChange={() => {}}
                />
            )
            expect(screen.getByText('Test Slider')).toBeInTheDocument()
            expect(screen.getByText('5')).toBeInTheDocument()
            expect(screen.getByLabelText('Test Slider')).toBeInTheDocument()
        })

        it('decrements value correctly via button', () => {
            const handleValueChange = jest.fn()
            render(
                <ControlSlider
                    label="Decrement Test"
                    value={5}
                    min={0}
                    max={10}
                    step={1}
                    onValueChange={handleValueChange}
                    onChange={() => {}}
                />
            )

            const decreaseButton = screen.getByRole('button', { name: /decrease decrement test/i })
            fireEvent.click(decreaseButton)

            expect(handleValueChange).toHaveBeenCalledWith(4)
        })

        it('increments value correctly via button', () => {
            const handleValueChange = jest.fn()
            render(
                <ControlSlider
                    label="Increment Test"
                    value={5}
                    min={0}
                    max={10}
                    step={1}
                    onValueChange={handleValueChange}
                    onChange={() => {}}
                />
            )

            const increaseButton = screen.getByRole('button', { name: /increase increment test/i })
            fireEvent.click(increaseButton)

            expect(handleValueChange).toHaveBeenCalledWith(6)
        })

        it('respects min boundary on decrement', () => {
            const handleValueChange = jest.fn()
            render(
                <ControlSlider
                    label="Min Boundary"
                    value={0}
                    min={0}
                    max={10}
                    step={1}
                    onValueChange={handleValueChange}
                    onChange={() => {}}
                />
            )

            const decreaseButton = screen.getByRole('button', { name: /decrease min boundary/i })
            expect(decreaseButton).toBeDisabled()

            fireEvent.click(decreaseButton)
            expect(handleValueChange).not.toHaveBeenCalled()
        })

        it('respects max boundary on increment', () => {
            const handleValueChange = jest.fn()
            render(
                <ControlSlider
                    label="Max Boundary"
                    value={10}
                    min={0}
                    max={10}
                    step={1}
                    onValueChange={handleValueChange}
                    onChange={() => {}}
                />
            )

            const increaseButton = screen.getByRole('button', { name: /increase max boundary/i })
            expect(increaseButton).toBeDisabled()

            fireEvent.click(increaseButton)
            expect(handleValueChange).not.toHaveBeenCalled()
        })

        it('handles floating point precision correctly', () => {
            const handleValueChange = jest.fn()
            render(
                <ControlSlider
                    label="Float Test"
                    value={0.1}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={handleValueChange}
                    onChange={() => {}}
                />
            )

            const increaseButton = screen.getByRole('button', { name: /increase float test/i })
            fireEvent.click(increaseButton)

            // Should be 0.2, not 0.20000000000000004
            expect(handleValueChange).toHaveBeenCalledWith(0.2)
        })

        it('handles floating point decrement correctly', () => {
             const handleValueChange = jest.fn()
             render(
                 <ControlSlider
                     label="Float Decrement"
                     value={0.3}
                     min={0}
                     max={1}
                     step={0.1}
                     onValueChange={handleValueChange}
                     onChange={() => {}}
                 />
             )

             const decreaseButton = screen.getByRole('button', { name: /decrease float decrement/i })
             fireEvent.click(decreaseButton)

             // Should be 0.2, not 0.19999999999999998
             expect(handleValueChange).toHaveBeenCalledWith(0.2)
        })

        it('renders disabled state correctly', () => {
            render(
                <ControlSlider
                    label="Disabled Test"
                    value={5}
                    min={0}
                    max={10}
                    disabled={true}
                    onChange={() => {}}
                />
            )

            const slider = screen.getByLabelText('Disabled Test')
            expect(slider).toBeDisabled()
            expect(screen.getByRole('button', { name: /decrease disabled test/i })).toBeDisabled()
            expect(screen.getByRole('button', { name: /increase disabled test/i })).toBeDisabled()
        })
    })

    describe('ControlSection', () => {
        it('renders title and children', () => {
            render(
                <ControlSection title="Test Section">
                    <div>Section Content</div>
                </ControlSection>
            )

            expect(screen.getByText('Test Section')).toBeInTheDocument()
            expect(screen.getByText('Section Content')).toBeInTheDocument()
        })

        it('toggles content visibility on click', () => {
            render(
                <ControlSection title="Toggle Section">
                    <div>Content</div>
                </ControlSection>
            )

            const button = screen.getByRole('button', { name: /toggle section/i })
            // Initially open by default
            expect(button).toHaveAttribute('aria-expanded', 'true')

            fireEvent.click(button)
            expect(button).toHaveAttribute('aria-expanded', 'false')

            fireEvent.click(button)
            expect(button).toHaveAttribute('aria-expanded', 'true')
        })

        it('respects defaultOpen prop', () => {
            render(
                <ControlSection title="Closed Section" defaultOpen={false}>
                    <div>Content</div>
                </ControlSection>
            )

            const button = screen.getByRole('button', { name: /closed section/i })
            expect(button).toHaveAttribute('aria-expanded', 'false')
        })
    })

    describe('ControlToggle', () => {
        it('renders with label', () => {
            render(
                <ControlToggle label="Test Toggle" checked={false} onChange={() => {}} />
            )
            expect(screen.getByText('Test Toggle')).toBeInTheDocument()
            expect(screen.getByRole('checkbox')).toBeInTheDocument()
        })

        it('calls onChange when clicked', () => {
            const handleChange = jest.fn()
            render(
                <ControlToggle label="Interactive Toggle" checked={false} onChange={handleChange} />
            )

            const checkbox = screen.getByRole('checkbox')
            fireEvent.click(checkbox)

            expect(handleChange).toHaveBeenCalled()
        })

        it('renders checked state correctly', () => {
             render(
                <ControlToggle label="Checked Toggle" checked={true} onChange={() => {}} />
            )
            expect(screen.getByRole('checkbox')).toBeChecked()
        })
    })

    describe('ControlPresetButton', () => {
        it('renders correctly with label and description', () => {
            render(
                <ControlPresetButton
                    label="Preset 1"
                    description="Test description"
                    onClick={() => {}}
                />
            )
            expect(screen.getByText('Preset 1')).toBeInTheDocument()
            expect(screen.getByText('Test description')).toBeInTheDocument()
        })

        it('handles click events', () => {
            const handleClick = jest.fn()
            render(
                <ControlPresetButton
                    label="Clickable Preset"
                    onClick={handleClick}
                />
            )

            fireEvent.click(screen.getByRole('button', { name: /clickable preset/i }))
            expect(handleClick).toHaveBeenCalled()
        })

        it('applies active state correctly', () => {
             render(
                <ControlPresetButton
                    label="Active Preset"
                    isActive={true}
                    onClick={() => {}}
                />
            )
            // Use aria-pressed to verify state
            const button = screen.getByRole('button', { name: /active preset/i })
            expect(button).toHaveAttribute('aria-pressed', 'true')
        })
    })
})
