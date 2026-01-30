import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/footer'

describe('Footer', () => {
    it('renders the copyright text with current year', () => {
        render(<Footer />)
        const year = new Date().getFullYear()
        expect(screen.getByText((content) => content.includes(`© ${year} TeachMaths.net`))).toBeInTheDocument()
    })

    it('renders social links', () => {
        render(<Footer />)
        const links = screen.getAllByRole('link')
        expect(links).toHaveLength(4)

        const expectedHrefs = [
            'https://github.com/jambrothers/mathtools', // Github
            '#', // Linkedin
            'https://bsky.app', // Bluesky
            'mailto:help@teachmaths.net' // Email
        ]

        // We can't easily rely on order if classes or structure changes, but for now we check existence
        // A better way is to look for specific icons or aria-labels if they existed. 
        // For now, let's just check if these hrefs exist in the document links.

        expectedHrefs.forEach(href => {
            expect(screen.getAllByRole('link').some(link => link.getAttribute('href') === href)).toBe(true)
        })
    })
})
