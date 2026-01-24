import '@testing-library/jest-dom'
import React from 'react'

// Polyfill PointerEvent for JSDOM (not natively supported)
class MockPointerEvent extends MouseEvent {
    public readonly pointerId: number;
    public readonly pointerType: string;
    public readonly pressure: number;
    public readonly width: number;
    public readonly height: number;

    constructor(type: string, props: PointerEventInit = {}) {
        super(type, props);
        this.pointerId = props.pointerId ?? 1;
        this.pointerType = props.pointerType ?? 'mouse';
        this.pressure = props.pressure ?? 0;
        this.width = props.width ?? 1;
        this.height = props.height ?? 1;
    }
}
(global as unknown as { PointerEvent: typeof MockPointerEvent }).PointerEvent = MockPointerEvent;

// Polyfill pointer capture methods for JSDOM
if (typeof Element !== 'undefined') {
    Element.prototype.setPointerCapture = Element.prototype.setPointerCapture || function () { };
    Element.prototype.releasePointerCapture = Element.prototype.releasePointerCapture || function () { };
    Element.prototype.hasPointerCapture = Element.prototype.hasPointerCapture || function () { return false; };
}

// Polyfill DOMRect for JSDOM
class MockDOMRect {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;

    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.top = y;
        this.right = x + width;
        this.bottom = y + height;
        this.left = x;
    }

    toJSON() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}
(global as unknown as { DOMRect: typeof MockDOMRect }).DOMRect = MockDOMRect;


jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
        return React.createElement('img', props)
    },
}))

// Mock react-markdown to render content as basic HTML for testing
jest.mock('react-markdown', () => ({
    __esModule: true,
    default: ({ children, components }: { children: string, components?: Record<string, React.ElementType> }) => {
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
                        const Img = components.img;
                        elements.push(React.createElement(Img, imgProps as React.ImgHTMLAttributes<HTMLImageElement>))
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
