import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolScaffold } from '@/components/tool-ui/tool-scaffold';

// Mock dependencies
jest.mock('@/components/tool-ui/interactive-tool-layout', () => ({
    InteractiveToolLayout: ({ children, sidebar, toolbarOverlay, footerOverlay, dataTestId }: any) => (
        <div data-testid="interactive-layout">
            <div data-testid="sidebar">{sidebar}</div>
            <div data-testid="toolbar-overlay">{toolbarOverlay}</div>
            <div data-testid="footer-overlay">{footerOverlay}</div>
            <div data-testid="content">{children}</div>
        </div>
    )
}));

jest.mock('@/components/tool-ui/resolution-guard', () => ({
    ResolutionGuard: ({ children }: { children: React.ReactNode }) => <div data-testid="resolution-guard">{children}</div>
}));

jest.mock('@/components/tool-ui/help-button', () => ({
    HelpButton: ({ onClick }: { onClick: () => void }) => (
        <button onClick={onClick} data-testid="help-button">Help</button>
    )
}));

jest.mock('@/components/tool-ui/help-modal', () => ({
    HelpModal: ({ content, onClose }: { content: string, onClose: () => void }) => (
        <div data-testid="help-modal">
            <div>{content}</div>
            <button onClick={onClose} data-testid="close-help">Close</button>
        </div>
    )
}));

describe('ToolScaffold', () => {
    it('renders children within ResolutionGuard', () => {
        render(
            <ToolScaffold>
                <div data-testid="child">Child Content</div>
            </ToolScaffold>
        );

        expect(screen.getByTestId('resolution-guard')).toBeInTheDocument();
        expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('does NOT render HelpButton when helpContent is missing', () => {
        render(
            <ToolScaffold>
                <div>Content</div>
            </ToolScaffold>
        );

        expect(screen.queryByTestId('help-button')).not.toBeInTheDocument();
    });

    it('renders HelpButton when helpContent is provided', () => {
        render(
            <ToolScaffold helpContent="# Help Me">
                <div>Content</div>
            </ToolScaffold>
        );

        expect(screen.getByTestId('help-button')).toBeInTheDocument();
    });

    it('shows HelpModal when HelpButton is clicked and hides it on close', () => {
        const helpContent = "# Help Me";
        render(
            <ToolScaffold helpContent={helpContent}>
                <div>Content</div>
            </ToolScaffold>
        );

        // Modal should not be visible initially
        expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument();

        // Click help button
        fireEvent.click(screen.getByTestId('help-button'));

        // Modal should be visible
        expect(screen.getByTestId('help-modal')).toBeInTheDocument();
        expect(screen.getByText(helpContent)).toBeInTheDocument();

        // Click close button
        fireEvent.click(screen.getByTestId('close-help'));

        // Modal should be hidden
        expect(screen.queryByTestId('help-modal')).not.toBeInTheDocument();
    });

    it('uses InteractiveToolLayout when useInteractiveLayout is true', () => {
        const sidebar = <div>Sidebar</div>;
        const toolbarOverlay = <div>Toolbar</div>;
        const footerOverlay = <div>Footer</div>;

        render(
            <ToolScaffold
                useInteractiveLayout={true}
                sidebar={sidebar}
                toolbarOverlay={toolbarOverlay}
                footerOverlay={footerOverlay}
            >
                <div>Content</div>
            </ToolScaffold>
        );

        expect(screen.getByTestId('interactive-layout')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar')).toHaveTextContent('Sidebar');
        expect(screen.getByTestId('toolbar-overlay')).toHaveTextContent('Toolbar');
        expect(screen.getByTestId('footer-overlay')).toHaveTextContent('Footer');
        expect(screen.getByTestId('content')).toHaveTextContent('Content');
    });

    it('uses standard layout when useInteractiveLayout is false (default)', () => {
        render(
            <ToolScaffold useInteractiveLayout={false}>
                <div data-testid="child">Content</div>
            </ToolScaffold>
        );

        expect(screen.queryByTestId('interactive-layout')).not.toBeInTheDocument();
        expect(screen.getByTestId('child')).toBeInTheDocument();
        // Check for the standard layout container class
        const container = screen.getByTestId('child').parentElement;
        expect(container).toHaveClass('relative', 'w-full', 'min-h-0', 'flex', 'flex-col');
    });
});
