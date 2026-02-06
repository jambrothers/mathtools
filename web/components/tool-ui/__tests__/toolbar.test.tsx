import { render, screen } from '@testing-library/react'
import { ToolbarButton } from '../toolbar'
import React from 'react'

describe('ToolbarButton', () => {
    it('uses label as accessible name when aria-label is missing', () => {
        render(<ToolbarButton label="Delete" />)
        const button = screen.getByRole('button')
        expect(button).toHaveAttribute('aria-label', 'Delete')
    })

    it('prefers explicit aria-label over label', () => {
        render(<ToolbarButton label="Delete" aria-label="Remove Item" />)
        const button = screen.getByRole('button')
        expect(button).toHaveAttribute('aria-label', 'Remove Item')
    })

    it('sets title attribute from label if missing', () => {
         render(<ToolbarButton label="Delete" />)
         const button = screen.getByRole('button')
         expect(button).toHaveAttribute('title', 'Delete')
    })

    it('prefers explicit title over label', () => {
        render(<ToolbarButton label="Delete" title="Remove Item" />)
        const button = screen.getByRole('button')
        expect(button).toHaveAttribute('title', 'Remove Item')
    })
})
