import { render } from '@testing-library/react'
import ToolsPage from '@/app/tools/page'

describe('Tools Page', () => {
    it('matches snapshot', () => {
        const { container } = render(<ToolsPage />)
        expect(container).toMatchSnapshot()
    })
})
