import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InteractiveToolLayout } from './interactive-tool-layout';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    ChevronRight: () => <div data-testid="chevron-right" />,
}));

describe('InteractiveToolLayout', () => {
    const originalInnerWidth = window.innerWidth;

    beforeEach(() => {
        // Reset window width
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalInnerWidth });
    });

    it('renders children correctly', () => {
        render(
            <InteractiveToolLayout>
                <div>Main Content</div>
            </InteractiveToolLayout>
        );
        expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    it('renders sidebar when provided', () => {
        render(
            <InteractiveToolLayout sidebar={<div>Sidebar Content</div>}>
                <div>Main Content</div>
            </InteractiveToolLayout>
        );
        expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
    });

    it('toggles sidebar when button is clicked', () => {
        render(
            <InteractiveToolLayout sidebar={<div>Sidebar Content</div>}>
                <div>Main Content</div>
            </InteractiveToolLayout>
        );

        const toggleButton = screen.getByTitle('Collapse Sidebar');
        fireEvent.click(toggleButton);

        // Sidebar content should effectively be hidden (width 0)
        // Since we test style prop, we can check the aside element's style or class
        // But checking title change is a good proxy for state change
        expect(screen.getByTitle('Expand Sidebar')).toBeInTheDocument();
    });

    it('auto-collapses sidebar on small screens', () => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });

        render(
            <InteractiveToolLayout sidebar={<div>Sidebar Content</div>}>
                <div>Main Content</div>
            </InteractiveToolLayout>
        );

        // Initially collapsed on mobile
        expect(screen.getByTitle('Expand Sidebar')).toBeInTheDocument();
    });

    it('renders overlays', () => {
        render(
            <InteractiveToolLayout
                toolbarOverlay={<div>Toolbar</div>}
                footerOverlay={<div>Footer</div>}
            >
                <div>Main Content</div>
            </InteractiveToolLayout>
        );

        expect(screen.getByText('Toolbar')).toBeInTheDocument();
        expect(screen.getByText('Footer')).toBeInTheDocument();
    });
});
