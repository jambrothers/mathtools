
import React from 'react';
import { render, screen } from '@testing-library/react';
import { SpeedControl } from './speed-control';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Rabbit: (props: React.ComponentProps<'svg'>) => <div data-testid="rabbit" {...props} />,
    Turtle: (props: React.ComponentProps<'svg'>) => <div data-testid="turtle" {...props} />,
}));

describe('SpeedControl Accessibility', () => {
    it('slider input has accessible label', () => {
        render(<SpeedControl speed={1000} onChange={() => {}} />);

        // Should be able to find the slider by its accessible name
        const slider = screen.getByLabelText('Animation Speed');
        expect(slider).toBeInTheDocument();
        expect(slider).toHaveAttribute('type', 'range');
    });

    it('icons are hidden from screen readers', () => {
        render(<SpeedControl speed={1000} onChange={() => {}} />);

        const rabbit = screen.getByTestId('rabbit');
        const turtle = screen.getByTestId('turtle');

        expect(rabbit).toHaveAttribute('aria-hidden', 'true');
        expect(turtle).toHaveAttribute('aria-hidden', 'true');
    });

    it('slider provides meaningful aria-valuetext', () => {
        // Test slowest speed (value 0)
        // max=2000, min=200. speed=2000 => slider=0
        const { unmount } = render(<SpeedControl speed={2000} onChange={() => {}} />);
        const slider = screen.getByLabelText('Animation Speed');
        // We expect custom text, not just "0"
        expect(slider).toHaveAttribute('aria-valuetext', expect.stringMatching(/Slowest|0%/));
        unmount();

        // Test fastest speed (value 100)
        // max=2000, min=200. speed=200 => slider=100
        render(<SpeedControl speed={200} onChange={() => {}} />);
        const fastSlider = screen.getByLabelText('Animation Speed');
        expect(fastSlider).toHaveAttribute('aria-valuetext', expect.stringMatching(/Fastest|100%/));
    });
});
