import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import LayoutShell from '@/components/LayoutShell';

export const metadata: Metadata = {
  title: 'TechPulse - Expert Product Reviews & Amazon Buying Guides',
  description: 'Unbiased, hands-on testing and in-depth product reviews for smartphones, laptops, TVs, audio gear, and home gadgets.',
  keywords: ['tech reviews', 'amazon deals', 'best smartphones', 'laptop buying guide', 'smartwatch review', 'best earbuds'],
  authors: [{ name: 'TechPulse Team' }],
  metadataBase: new URL('https://techpulsereviews.com'),
  openGraph: {
    title: 'TechPulse - Expert Product Reviews & Buying Guides',
    description: 'In-depth reviews and Amazon affiliate buying recommendations.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col justify-between bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans">
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
