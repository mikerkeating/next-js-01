import { Inter } from 'next/font/google';

import type { Metadata } from 'next';

import '@/env';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MK3 Platform',
  description: 'A Next.js 16 application built with TypeScript, React 19, and Tailwind CSS 4',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
