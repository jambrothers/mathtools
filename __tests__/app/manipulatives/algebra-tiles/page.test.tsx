import { render } from '@testing-library/react'
import AlgebraTilesPage from '@/app/manipulatives/algebra-tiles/page'

// Mock the child components to avoid testing their implementation details in the page snapshot
// or complex interactions (like DndContext).
// However, for a snapshot of the page structure, we might want some render.
// AlgebraTilesPage seems to import AlgebraTiles component.
// Let's assume we want to snapshot the high level page structure.

jest.mock('@/app/manipulatives/algebra-tiles/_components/algebra-tile', () => ({
    AlgebraTile: () => <div data-testid="algebra-tile">Tile</div>
}))

jest.mock('@/components/set-page-title', () => ({
    SetPageTitle: () => null
}))

// We need to check if AlgebraTilesPage is client or server.
// If it imports client components, it might be okay.
// Let's check the file content first if we haven't.

describe('AlgebraTiles Page', () => {
    it('matches snapshot', () => {
        const { container } = render(<AlgebraTilesPage />)
        expect(container).toMatchSnapshot()
    })
})
