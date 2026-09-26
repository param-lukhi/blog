import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Saved Wishlist - BlogWeb904',
  description: 'Your saved tech reviews, buying guides, and product picks on BlogWeb904.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
