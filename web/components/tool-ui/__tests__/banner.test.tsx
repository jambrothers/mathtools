
import { render, screen, fireEvent } from '@testing-library/react'
import { Banner } from '../banner'
import { AlertCircle } from 'lucide-react'

describe('Banner', () => {
    it('is a presentational component that renders title and description', () => {
        render(
            <Banner
                title="Test Title"
                description="Test Description"
                onDismiss={() => { }}
            />
        )
        expect(screen.getByText('Test Title')).toBeInTheDocument()
        expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('renders custom icon', () => {
        render(
            <Banner
                title="Title"
                description="Desc"
                icon={<AlertCircle data-testid="test-icon" />}
                onDismiss={() => { }}
            />
        )
        expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })

    it('calls onDismiss when dismiss button clicked', () => {
        const handleDismiss = jest.fn()
        render(
            <Banner
                title="Title"
                description="Desc"
                onDismiss={handleDismiss}
            />
        )

        fireEvent.click(screen.getByText('Continue Anyway'))
        expect(handleDismiss).toHaveBeenCalledTimes(1)
    })

    it('renders custom dismiss label', () => {
        render(
            <Banner
                title="Title"
                description="Desc"
                onDismiss={() => { }}
                dismissLabel="Close Me"
            />
        )
        expect(screen.getByText('Close Me')).toBeInTheDocument()
    })
})
