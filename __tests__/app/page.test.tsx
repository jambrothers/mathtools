import { render } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
    it('matches snapshot', () => {
        const { container } = render(<Home />)
        expect(container).toMatchSnapshot()
    })
})
