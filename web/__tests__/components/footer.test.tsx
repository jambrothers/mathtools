import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/footer'

describe('Footer', () => {
    it('renders the copyright text with current year', () => {
        render(<Footer />)
        const year = new Date().getFullYear()
        expect(screen.getByText((content) => content.includes(`© ${year} TeachMaths.net`))).toBeInTheDocument()
    })

    it('renders social links with accessible labels', () => {
        render(<Footer />)

        expect(screen.getByRole('link', { name: /LinkedIn/i })).toHaveAttribute('href', '#')
        expect(screen.getByRole('link', { name: /Bluesky/i })).toHaveAttribute('href', 'https://bsky.app')
        expect(screen.getByRole('link', { name: /Email/i })).toHaveAttribute('href', 'mailto:help@teachmaths.net')
    })
})
