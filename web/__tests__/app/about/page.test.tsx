import { render } from '@testing-library/react'
import AboutPage from '@/app/about/page'

describe('About Page', () => {
    it('matches snapshot', () => {
        const { container } = render(<AboutPage />)
        expect(container).toMatchSnapshot()
    })
})
