import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'MK3 Platform Documentation',
    template: '%s | MK3 Docs'
  },
  description: 'Documentation for the MK3 Platform - Architecture, guides, and API references',
  keywords: ['documentation', 'MK3', 'platform', 'architecture', 'guides'],
  authors: [{ name: 'MK3 Team' }]
}

const navbar = (
  <Navbar
    logo={<strong>MK3 Platform</strong>}
    projectLink="https://github.com/mkcubed/next-js-01"
  />
)

const footer = (
  <Footer>
    <span>MIT {new Date().getFullYear()} &copy; MK3 Platform</span>
  </Footer>
)

interface RootLayoutProps {
  children: ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps): Promise<ReactNode> {
  const pageMap = await getPageMap()

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/mkcubed/next-js-01/tree/main/docs"
          footer={footer}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          toc={{ float: true }}
          editLink="Edit this page on GitHub"
          feedback={{ content: 'Question? Give us feedback' }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
