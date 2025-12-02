import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Footer, Layout, Navbar } from "nextra-theme-docs";

import "nextra-theme-docs/style.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const GITHUB_REPO =
  process.env.NEXT_PUBLIC_DOCS_GITHUB_REPO ?? "https://github.com/mikerkeating/next-js-01";
const DOCS_BRANCH = process.env.NEXT_PUBLIC_DOCS_GITHUB_BRANCH ?? "development";
const DOCS_PATH = process.env.NEXT_PUBLIC_DOCS_PATH ?? "docs";

export const metadata: Metadata = {
  title: {
    default: "MK3 Platform Documentation",
    template: "%s | MK3 Docs",
  },
  description: "Documentation for the MK3 Platform - Architecture, guides, and API references",
  keywords: ["documentation", "MK3", "platform", "architecture", "guides"],
  authors: [{ name: "MK3 Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

const navbar = <Navbar logo={<strong>MK3 Platform</strong>} projectLink={GITHUB_REPO} />;

function SiteFooter() {
  return (
    <Footer>
      <span>MIT {new Date().getFullYear()} &copy; MK3 Platform</span>
    </Footer>
  );
}

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps): Promise<ReactNode> {
  const pageMap = await getPageMap();

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={pageMap}
          docsRepositoryBase={`${GITHUB_REPO}/tree/${DOCS_BRANCH}/${DOCS_PATH}`}
          footer={<SiteFooter />}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          toc={{ float: true }}
          editLink="Edit this page on GitHub"
          feedback={{ content: "Question? Give us feedback" }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
