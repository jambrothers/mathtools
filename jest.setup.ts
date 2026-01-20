import '@testing-library/jest-dom'
import React from 'react'

jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return React.createElement('img', props)
    },
}))

// Mock react-markdown to render content as basic HTML for testing
jest.mock('react-markdown', () => ({
    __esModule: true,
    default: ({ children, components }: { children: string, components?: any }) => {
        // Simple markdown parsing for testing
        const lines = children.split('\n')
        const elements: React.ReactNode[] = []

        lines.forEach((line, index) => {
            const trimmed = line.trim()
            if (!trimmed) return

            // Headers
            if (trimmed.startsWith('### ')) {
                elements.push(React.createElement('h3', { key: index }, trimmed.slice(4)))
            } else if (trimmed.startsWith('## ')) {
                elements.push(React.createElement('h2', { key: index }, trimmed.slice(3)))
            } else if (trimmed.startsWith('# ')) {
                elements.push(React.createElement('h1', { key: index }, trimmed.slice(2)))
            }
            // Images
            else if (trimmed.match(/!\[(.+?)\]\((.+?)\)/)) {
                const match = trimmed.match(/!\[(.+?)\]\((.+?)\)/)
                if (match) {
                    const imgProps = { alt: match[1], src: match[2], key: index }
                    if (components?.img) {
                        elements.push(components.img(imgProps))
                    } else {
                        elements.push(React.createElement('img', imgProps))
                    }
                }
            }
            // List items
            else if (trimmed.startsWith('- ')) {
                elements.push(React.createElement('li', { key: index }, trimmed.slice(2)))
            }
            // Bold text handling in paragraphs
            else if (trimmed.includes('**')) {
                const parts = trimmed.split(/\*\*(.+?)\*\*/)
                const nodes = parts.map((part, i) =>
                    i % 2 === 1
                        ? React.createElement('strong', { key: i }, part)
                        : part
                )
                elements.push(React.createElement('p', { key: index }, ...nodes))
            }
            // Regular paragraph
            else {
                elements.push(React.createElement('p', { key: index }, trimmed))
            }
        })

        return React.createElement('div', null, ...elements)
    }
}))
