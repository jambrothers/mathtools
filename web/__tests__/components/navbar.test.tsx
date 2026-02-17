/* eslint-disable @typescript-eslint/no-unused-vars */
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Navbar } from '@/components/navbar'
import * as PageTitleContext from '@/components/page-title-context'

// Mock hooks
jest.mock('next/navigation', () => ({
    usePathname: () => '/',
}))

jest.mock('next-themes', () => ({
    useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}))

// Mock context
jest.mock('@/components/page-title-context', () => ({
    usePageTitle: jest.fn(),
}))

describe('Navbar', () => {

    beforeEach(() => {
        (PageTitleContext.usePageTitle as jest.Mock).mockReturnValue({
            title: 'Test Title',
            setTitle: jest.fn(),
        })
    })

    it('renders TeachMaths.net logo', () => {
        render(<Navbar />)
        expect(screen.getByText('TeachMaths.net')).toBeInTheDocument()
    })

    it('renders Main Navigation links', () => {
        render(<Navbar />)
        expect(screen.getByText('Home')).toBeInTheDocument()
        expect(screen.getByText('About')).toBeInTheDocument()
        expect(screen.getByText('Tools')).toBeInTheDocument()
    })

    it('renders Page Title when provided', () => {
        render(<Navbar />)
        expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('renders the mobile menu toggle with accessible label', () => {
        render(<Navbar />)
        // The button is md:hidden, but in JSDOM default size it might be visible or hidden depending on setup.
        // However, standard testing-library queries don't check visibility (display:none) by default unless configured.
        // We just want to ensure the button exists with the correct aria-label.

        const menuButton = screen.getByRole('button', { name: /Toggle mobile menu/i })
        expect(menuButton).toBeInTheDocument()
    })
})
