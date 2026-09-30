import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | TechPulse',
  description: 'Have feedback on a review, a question about a product comparison, or an editorial inquiry? Get in touch with the TechPulse team.',
  openGraph: {
    title: 'Contact Us | TechPulse',
    description: 'Get in touch with the TechPulse editorial and reviews team.',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
