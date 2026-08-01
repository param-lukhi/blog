import React from 'react';

export const metadata = {
  title: 'Amazon Affiliate Disclosure - TechPulse Reviews',
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose font-sans">
      <h1>Amazon Affiliate Disclosure</h1>

      <p>TechPulse Reviews is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com and affiliated sites.</p>

      <h2>How We Maintain Editorial Integrity</h2>
      <p>Our editorial content is completely independent of affiliate partnerships. We select products for review based on consumer popularity, technical interest, and market demand. Manufacturers do not pay for high ratings or preferred rankings on TechPulse Reviews.</p>

      <h2>Pricing & Availability</h2>
      <p>Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon.com at the time of purchase will apply to the purchase of this product.</p>
    </div>
  );
}
