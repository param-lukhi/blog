export interface ProductSchemaProps {
  name: string;
  description: string;
  image: string;
  brand: string;
  price: string;
  currency?: string;
  url: string;
  ratingValue?: number;
  reviewCount?: number;
}

export function generateProductSchema(p: ProductSchemaProps) {
  const cleanPrice = p.price.replace(/[^0-9.]/g, '') || '999';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: p.image,
    brand: {
      '@type': 'Brand',
      name: p.brand,
    },
    offers: {
      '@type': 'Offer',
      price: cleanPrice,
      priceCurrency: p.currency || 'USD',
      availability: 'https://schema.org/InStock',
      url: p.url,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: p.ratingValue || 4.8,
      reviewCount: p.reviewCount || 124,
    },
  };
}

export interface ReviewSchemaProps {
  title: string;
  description: string;
  image: string;
  author?: string;
  datePublished?: string;
  itemReviewed: {
    name: string;
    brand: string;
  };
  ratingValue?: number;
}

export function generateReviewSchema(r: ReviewSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: r.title,
    description: r.description,
    image: r.image,
    author: {
      '@type': 'Person',
      name: r.author || 'TechPulse Editorial Team',
    },
    datePublished: r.datePublished || new Date().toISOString(),
    itemReviewed: {
      '@type': 'Product',
      name: r.itemReviewed.name,
      brand: {
        '@type': 'Brand',
        name: r.itemReviewed.brand,
      },
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: r.ratingValue || 4.9,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TechPulse',
    url: 'https://techpulsereviews.com',
    logo: 'https://techpulsereviews.com/logo.png',
    sameAs: [
      'https://twitter.com/techpulse',
      'https://facebook.com/techpulse',
    ],
  };
}
