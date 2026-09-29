import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Side-by-Side Tech Product Comparisons - TechPulse',
  description: 'Compare any two smartphones, laptops, headphones, or smart TVs side-by-side with detailed specs, price tracking, and feature analysis.',
  alternates: {
    canonical: '/comparisons',
  },
  openGraph: {
    title: 'Side-by-Side Tech Product Comparisons - TechPulse',
    description: 'Compare any two smartphones, laptops, headphones, or smart TVs side-by-side with detailed specs and price tracking.',
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
