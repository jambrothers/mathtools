import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
})

// Add any custom config to be passed to Jest
const config: Config = {
    coverageProvider: 'v8',
    testEnvironment: 'jsdom',
    // Add more setup options before each test is run
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/components/(.*)$': '<rootDir>/components/$1',
        '^@/app/(.*)$': '<rootDir>/app/$1',
        '^@/lib/(.*)$': '<rootDir>/lib/$1',
    },
    // Transform ES modules from react-markdown and its dependencies
    transformIgnorePatterns: [
        'node_modules/(?!(react-markdown|remark-parse|remark-rehype|unified|bail|is-plain-obj|trough|vfile|vfile-message|unist-util-stringify-position|mdast-util-from-markdown|mdast-util-to-string|micromark|decode-named-character-reference|character-entities|mdast-util-to-hast|unist-util-position|unist-util-visit|unist-util-is|hast-util-whitespace|space-separated-tokens|comma-separated-tokens|property-information|hast-util-to-jsx-runtime|estree-util-is-identifier-name|devlop|unist-util-position-from-estree|ccount|escape-string-regexp|markdown-table|zwitch|longest-streak|unist-util-visit-parents|trim-lines)/)',
    ],
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
