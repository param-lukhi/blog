import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Side-by-Side Product Comparisons - BlogWeb904',
  description: 'Compare products side-by-side with detailed specs, price tracking, and feature analysis.',
  alternates: {
    canonical: 'https://blogweb904.vercel.app/comparisons',
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Side-by-Side Product Comparisons - BlogWeb904',
    description: 'Compare products side-by-side with detailed specs and price tracking.',
    type: 'website',
  },
};

export default function ComparisonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
