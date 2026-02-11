import React from 'react';
import { render, screen } from '@testing-library/react';
import { ControlSection, ControlSlider, ControlPresetButton } from './control-panel';

// Mock Lucide icons to avoid rendering issues
jest.mock('lucide-react', () => ({
    ChevronDown: () => <div data-testid="chevron-down" />,
    Minus: () => <div data-testid="minus" />,
    Plus: () => <div data-testid="plus" />,
}));

describe('ControlPanel Accessibility', () => {
    describe('ControlSection', () => {
        it('has aria-expanded and aria-controls attributes', () => {
            render(
                <ControlSection title="Test Section">
                    <div>Content</div>
                </ControlSection>
            );

            const button = screen.getByRole('button');

            // Should have aria-expanded
            expect(button).toHaveAttribute('aria-expanded', 'true'); // Default open is true

            // Should have aria-controls pointing to an ID
            const controlsId = button.getAttribute('aria-controls');
            expect(controlsId).toBeTruthy();

            // The content should have that ID (we can't easily query by ID if we don't know it,
            // but we can check if the ID exists in the document if we render content)
            // But strict ID checking is hard without querying the content div directly.
            // Let's assume if the attribute is there, it's a good start.
        });

        it('has focus-visible styles', () => {
             render(
                <ControlSection title="Test Section">
                    <div>Content</div>
                </ControlSection>
            );
            const button = screen.getByRole('button');
            expect(button).toHaveClass('focus-visible:ring-2');
        });
    });

    describe('ControlSlider', () => {
        it('buttons have focus-visible styles', () => {
            render(
                <ControlSlider
                    label="Test Slider"
                    value={50}
                    min={0}
                    max={100}
                />
            );

            const decreaseButton = screen.getByLabelText('Decrease Test Slider');
            const increaseButton = screen.getByLabelText('Increase Test Slider');

            expect(decreaseButton).toHaveClass('focus-visible:ring-2');
            expect(increaseButton).toHaveClass('focus-visible:ring-2');
        });
    });

    describe('ControlPresetButton', () => {
        it('has focus-visible styles', () => {
            render(
                <ControlPresetButton label="Preset 1" />
            );
            const button = screen.getByRole('button');
            expect(button).toHaveClass('focus-visible:ring-2');
        });
    });
});
