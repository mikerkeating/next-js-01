import nextra from 'nextra'

/**
 * Nextra configuration for documentation site
 * - search.codeblocks: false - Excludes code blocks from search index for cleaner results
 * - contentDirBasePath: '/docs' - Maps content to /docs route
 *
 * Content is served from ./content directory (symlinked to ../../docs)
 */
const withNextra = nextra({
  search: {
    codeblocks: false
  },
  contentDirBasePath: '/docs'
})

export default withNextra({
  reactStrictMode: true,
  // Transpile nextra packages for monorepo compatibility
  transpilePackages: ['nextra', 'nextra-theme-docs']
})
