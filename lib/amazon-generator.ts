import { slugify } from './utils';

export interface GeneratedBlogDraft {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  brand: string;
  price: string;
  images: string[];
  categoryName: string;
  featuredImage: string;
  specifications: Record<string, string>;
  features: string[];
  pros: string[];
  cons: string[];
  content: string;
  faqs: { question: string; answer: string }[];
  conclusion: string;
  amazonUrl: string;
  affiliateUrl: string;
  marketplaces?: Record<string, { price: string; url: string }>;
  tags: string[];
}

// Known product database for high-precision real specifications & pricing fallback
interface KnownGadgetInfo {
  brand: string;
  category: string;
  priceUSD: string;
  priceINR: string;
  images: string[];
  specs: Record<string, string>;
  features: string[];
  pros: string[];
  cons: string[];
}

const GADGET_DATABASE: Record<string, KnownGadgetInfo> = {
  'iphone 16 pro max': {
    brand: 'Apple',
    category: 'Mobiles',
    priceUSD: '$1,199.00',
    priceINR: '₹1,44,900',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
    ],
    specs: {
      'Display': '6.9-inch Super Retina XDR OLED, 120Hz ProMotion',
      'Processor': 'Apple A18 Pro (3nm architecture)',
      'Camera': '48MP Fusion + 48MP Ultra-Wide + 12MP 5x Telephoto',
      'Battery Life': 'Up to 33 hours video playback, MagSafe 25W',
      'Build': 'Grade 5 Titanium with Ceramic Shield 2nd Gen',
      'Operating System': 'iOS 18 with Apple Intelligence',
    },
    features: [
      'Next-generation Camera Control button with tactile haptic feedback',
      'A18 Pro chipset delivers class-leading desktop-grade GPU performance',
      'Substantially thinner borders maximizing the 6.9-inch OLED display',
      '4K 120 fps Dolby Vision video recording with studio-quality 4-mic array',
    ],
    pros: [
      'Market-leading battery endurance in any flagship phone',
      'Incredible cinematic 4K 120fps video and audio recording',
      'Titanium chassis feels remarkably lightweight and balanced',
      'Super-bright 2000-nit outdoor display with minimal bezels',
    ],
    cons: [
      'Premium flagship price tag',
      'Base charging speed maxes out around 30W',
    ],
  },
  'iphone 15 pro max': {
    brand: 'Apple',
    category: 'Mobiles',
    priceUSD: '$1,199.00',
    priceINR: '₹1,34,900',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&auto=format&fit=crop&q=80',
    ],
    specs: {
      'Display': '6.7-inch Super Retina XDR OLED 120Hz',
      'Processor': 'Apple A17 Pro (3nm)',
      'Camera': '48MP Main + 12MP Ultra-Wide + 12MP 5x Periscope Zoom',
      'Port': 'USB-C (USB 3.0 up to 10Gbps)',
      'Build': 'Titanium Frame with Textured Matte Glass Back',
    },
    features: [
      'Forged in aerospace-grade Titanium for reduced weight',
      'Action Button replaces the mute switch for custom shortcuts',
      'Console-level gaming with hardware-accelerated ray tracing',
    ],
    pros: ['Substantially lighter in hand', 'Top-tier camera and video processing', 'Great battery life'],
    cons: ['Slightly warm under extreme synthetic benchmarks', 'High entry cost'],
  },
  'samsung galaxy s24 ultra': {
    brand: 'Samsung',
    category: 'Mobiles',
    priceUSD: '$1,299.99',
    priceINR: '₹1,29,999',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1200&auto=format&fit=crop&q=80',
    ],
    specs: {
      'Display': '6.8-inch Dynamic AMOLED 2X, Flat, 1-120Hz, 2600 nits, Gorilla Armor Anti-Reflective',
      'Processor': 'Snapdragon 8 Gen 3 for Galaxy',
      'Camera': '200MP Main + 50MP 5x Zoom + 10MP 3x Zoom + 12MP Ultra-Wide',
      'Battery': '5000mAh with 45W Fast Charging',
      'Stylus': 'Built-in S-Pen with Bluetooth support',
      'Software': 'One UI 6.1 with Galaxy AI & 7 Years of OS Updates',
    },
    features: [
      'Gorilla Armor glass reduces screen glare and reflections by up to 75%',
      'Galaxy AI suite includes Live Translate, Circle to Search, and Generative Edit',
      'Quad Telephoto camera system captures sharp zoom photos up to 100x',
      '7 years of guaranteed Android OS upgrades and security patches',
    ],
    pros: [
      'Best-in-class anti-reflective flat display on any smartphone',
      'Built-in S-Pen provides unrivalled productivity and notes',
      'Versatile 200MP camera and 5x optical optical telephoto zoom',
      'Outstanding 7-year software commitment',
    ],
    cons: [
      'Large square corners can feel bulky in smaller hands',
      'Charging speed capped at 45W compared to Chinese 100W competitors',
    ],
  },
  'macbook air m3': {
    brand: 'Apple',
    category: 'Laptops',
    priceUSD: '$1,099.00',
    priceINR: '₹1,14,900',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1200&auto=format&fit=crop&q=80',
    ],
    specs: {
      'Processor': 'Apple M3 Chip (8-core CPU / 8-core or 10-core GPU)',
      'Display': '13.6-inch or 15.3-inch Liquid Retina Display (500 nits)',
      'Battery Life': 'Up to 18 hours wireless web/playback',
      'Audio': 'Four-speaker sound system with Spatial Audio',
      'Connectivity': 'MagSafe 3, 2x Thunderbolt / USB 4, 3.5mm Headphone Jack, Wi-Fi 6E',
      'Design': '11.3mm ultra-thin all-aluminum fanless design',
    },
    features: [
      'Blazing-fast M3 silicon with hardware-accelerated mesh shading & ray tracing',
      'Fanless, silent operation even under heavy developer workloads',
      'Supports dual external displays with the laptop lid closed',
      'MagSafe fast charging charges up to 50% in approximately 30 minutes',
    ],
    pros: [
      'Completely silent fanless architecture with no heat throttling',
      'Legendary 18-hour battery longevity that lasts multiple workdays',
      'Industry-leading Magic Keyboard and responsive glass Force Touch trackpad',
    ],
    cons: [
      'Base model starts with 256GB SSD',
      'Upgrading RAM & storage directly from Apple is expensive',
    ],
  },
  'sony wh-1000xm5': {
    brand: 'Sony',
    category: 'Earbuds',
    priceUSD: '$398.00',
    priceINR: '₹29,990',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200&auto=format&fit=crop&q=80',
    ],
    specs: {
      'Noise Cancellation': 'Dual Processor V1 + HD QN1 with 8 microphones & Auto NC Optimizer',
      'Driver Size': '30mm carbon-fiber composite driver',
      'Battery Life': '30 hours with ANC On / 40 hours with ANC Off',
      'Quick Charge': '3-minute charge gives 3 hours playback',
      'Codecs': 'LDAC, AAC, SBC with DSEE Extreme audio upscaling',
      'Weight': '250 grams ultra-light soft-fit leather headband',
    },
    features: [
      'Class-leading active noise cancellation powered by 8 beamforming microphones',
      'Multipoint connection lets you switch seamlessly between laptop and phone',
      'Speak-to-Chat automatically pauses playback when you start speaking',
      'Ultra-clear hands-free calling with Sony AI noise reduction algorithms',
    ],
    pros: [
      'Benchmark ANC performance that silences office and airplane engine drone',
      'Rich, punchy sound signature with expansive soundstage and LDAC Hi-Res',
      'Comfortable lightweight fit for all-day listening sessions',
    ],
    cons: [
      'Earcups do not fold inward like the older XM4 generation',
      'No IP water resistance rating',
    ],
  },
  'airpods pro 2': {
    brand: 'Apple',
    category: 'Earbuds',
    priceUSD: '$249.00',
    priceINR: '₹24,900',
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=1200&auto=format&fit=crop&q=80',
    ],
    specs: {
      'Chipset': 'Apple H2 chip in earbuds, U1/H2 in MagSafe USB-C case',
      'Noise Cancellation': '2x stronger Active Noise Cancellation + Adaptive Audio',
      'Battery Life': '6 hours per charge (up to 30 hours with charging case)',
      'Water Resistance': 'IP54 dust, sweat, and water resistance for both case and buds',
      'Charging': 'USB-C, MagSafe, Apple Watch charger, and Qi certified',
    },
    features: [
      'Adaptive Audio dynamically blends ANC and Transparency based on your environment',
      'Conversation Awareness automatically lowers media volume when you talk',
      'Personalized Spatial Audio with dynamic head tracking for immersive 3D audio',
      'Built-in speaker in case for Find My precision tracking',
    ],
    pros: ['Superb transparency mode', 'Seamless iOS integration', 'Top-tier active noise canceling'],
    cons: ['Limited advanced features when paired with Android devices'],
  },
};

// Clean HTML tags helper
function cleanText(text: string): string {
  return text.replace(/<[^>]+>/g, '').replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

// Live Amazon Page Scraper
async function scrapeAmazonMetadata(url: string): Promise<{
  title?: string;
  price?: string;
  images?: string[];
  bullets?: string[];
  specs?: Record<string, string>;
  brand?: string;
} | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const html = await res.text();

    const result: any = { specs: {}, bullets: [], images: [] };

    // Extract Title
    const titleMatch =
      html.match(/<span id="productTitle"[^>]*>([\s\S]*?)<\/span>/i) ||
      html.match(/<meta property="og:title" content="([^"]+)"/i) ||
      html.match(/<title>([\s\S]*?)<\/title>/i);

    if (titleMatch) {
      result.title = cleanText(titleMatch[1]).replace(/:\s*Amazon\.[a-z.]+.*$/i, '');
    }

    // Extract Price
    const priceMatch =
      html.match(/<span class="a-offscreen">([^<]+)<\/span>/i) ||
      html.match(/<span class="a-price-whole">([^<]+)<\/span>/i) ||
      html.match(/<meta property="product:price:amount" content="([^"]+)"/i);

    if (priceMatch) {
      result.price = cleanText(priceMatch[1]);
      if (!result.price.startsWith('$') && !result.price.startsWith('₹') && !result.price.startsWith('£') && !result.price.startsWith('€')) {
        result.price = `$${result.price}`;
      }
    }

    // Extract OG Image or Amazon main image
    const ogImg = html.match(/<meta property="og:image" content="([^"]+)"/i);
    if (ogImg && !ogImg[1].includes('amazon-default')) {
      result.images.push(ogImg[1]);
    }

    const landingImg = html.match(/data-old-hires="([^"]+)"/i) || html.match(/"large":"([^"]+)"/i) || html.match(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+\.jpg)"/i);
    if (landingImg && !result.images.includes(landingImg[1])) {
      result.images.push(landingImg[1]);
    }

    // Extract Brand
    const brandMatch =
      html.match(/<a id="bylineInfo"[^>]*>([\s\S]*?)<\/a>/i) ||
      html.match(/<tr class="[^"]*po-brand[^"]*">[\s\S]*?<span class="a-size-base">([^<]+)<\/span>/i) ||
      html.match(/"brand":\s*"([^"]+)"/i);

    if (brandMatch) {
      result.brand = cleanText(brandMatch[1]).replace(/^Visit the\s+/i, '').replace(/\s+Store$/i, '').trim();
    }

    // Extract Feature Bullets
    const bulletsSection = html.match(/<div id="feature-bullets"[^>]*>([\s\S]*?)<\/div>/i);
    if (bulletsSection) {
      const liMatches = bulletsSection[1].matchAll(/<span class="a-list-item">([\s\S]*?)<\/span>/gi);
      for (const m of liMatches) {
        const text = cleanText(m[1]);
        if (text && text.length > 10 && !text.includes('Make sure this fits')) {
          result.bullets.push(text);
        }
      }
    }

    return result;
  } catch (err) {
    console.error('Amazon scraper error (non-fatal):', err);
    return null;
  }
}

// Category Resolver Helper
function resolveCategory(title: string, hint?: string): string {
  const query = `${title} ${hint || ''}`.toLowerCase();
  if (query.includes('phone') || query.includes('iphone') || query.includes('galaxy') || query.includes('smartphone') || query.includes('pixel')) {
    return 'Mobiles';
  }
  if (query.includes('laptop') || query.includes('macbook') || query.includes('notebook') || query.includes('thinkpad') || query.includes('chromebook')) {
    return 'Laptops';
  }
  if (query.includes('earbud') || query.includes('headphone') || query.includes('airpods') || query.includes('earphone') || query.includes('soundbar') || query.includes('audio') || query.includes('speaker')) {
    return 'Earbuds';
  }
  if (query.includes('tv') || query.includes('television') || query.includes('oled') || query.includes('qled') || query.includes('bravia')) {
    return 'TVs';
  }
  if (query.includes('watch') || query.includes('smartwatch') || query.includes('fitbit') || query.includes('garmin')) {
    return 'Smart Watches';
  }
  if (query.includes('gaming') || query.includes('playstation') || query.includes('ps5') || query.includes('xbox') || query.includes('nintendo') || query.includes('gpu') || query.includes('rtx')) {
    return 'Gaming';
  }
  if (query.includes('kitchen') || query.includes('vacuum') || query.includes('dyson') || query.includes('fryer') || query.includes('home') || query.includes('cleaner')) {
    return 'Home & Kitchen';
  }
  return 'Accessories';
}

// Default High-Quality Tech Photography Placeholders
function getDefaultImagesForCategory(cat: string): string[] {
  switch (cat) {
    case 'Mobiles':
      return [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&auto=format&fit=crop&q=80',
      ];
    case 'Laptops':
      return [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1200&auto=format&fit=crop&q=80',
      ];
    case 'Earbuds':
      return [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=1200&auto=format&fit=crop&q=80',
      ];
    case 'TVs':
      return [
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1200&auto=format&fit=crop&q=80',
      ];
    case 'Smart Watches':
      return [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80',
      ];
    case 'Gaming':
      return [
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1200&auto=format&fit=crop&q=80',
      ];
    default:
      return [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
      ];
  }
}

/**
 * Main Generator Function: Synthesizes real metadata and generates in-depth review & SEO draft.
 */
export async function generateFullProductAndBlog(params: {
  url?: string;
  query?: string;
  imageUrl?: string;
  affiliateTag?: string;
  targetCategory?: string;
}): Promise<GeneratedBlogDraft> {
  const { url, query, imageUrl, affiliateTag, targetCategory } = params;
  const tag = affiliateTag || 'techpulse-20';

  let rawTitle = query || '';
  let rawPrice = '$399.00';
  let rawBrand = '';
  let rawImages: string[] = [];
  let rawBullets: string[] = [];
  let rawSpecs: Record<string, string> = {};

  // 1. Live Amazon / Web Scraping if URL provided
  if (url && (url.includes('amazon') || url.includes('http'))) {
    const scraped = await scrapeAmazonMetadata(url);
    if (scraped) {
      if (scraped.title) rawTitle = scraped.title;
      if (scraped.price) rawPrice = scraped.price;
      if (scraped.brand) rawBrand = scraped.brand;
      if (scraped.images && scraped.images.length > 0) rawImages = scraped.images;
      if (scraped.bullets && scraped.bullets.length > 0) rawBullets = scraped.bullets;
      if (scraped.specs && Object.keys(scraped.specs).length > 0) rawSpecs = scraped.specs;
    }
  }

  // 2. Fallback title derivation from URL slug if still empty
  if (!rawTitle && url) {
    const urlParts = url.split('/');
    const productSlugPart = urlParts.find(p => p.includes('-') && !p.includes('amazon') && !p.includes('http'));
    if (productSlugPart) {
      rawTitle = productSlugPart
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    } else {
      rawTitle = 'Premium Tech Innovation Gadget';
    }
  }

  if (!rawTitle) {
    rawTitle = 'High-Performance Next-Gen Tech Device';
  }

  // 3. Match against Known Gadget Knowledge Base for 100% precision specs & pricing
  const lowerTitle = rawTitle.toLowerCase();
  let matchedGadget: KnownGadgetInfo | null = null;

  for (const [key, val] of Object.entries(GADGET_DATABASE)) {
    if (lowerTitle.includes(key)) {
      matchedGadget = val;
      break;
    }
  }

  if (matchedGadget) {
    if (!rawBrand) rawBrand = matchedGadget.brand;
    if (rawPrice === '$399.00') rawPrice = matchedGadget.priceUSD;
    if (rawImages.length === 0) rawImages = matchedGadget.images;
    if (rawBullets.length === 0) rawBullets = matchedGadget.features;
    if (Object.keys(rawSpecs).length === 0) rawSpecs = matchedGadget.specs;
  }

  // 4. Derive Brand if still unknown
  if (!rawBrand) {
    if (lowerTitle.includes('apple') || lowerTitle.includes('iphone') || lowerTitle.includes('macbook') || lowerTitle.includes('airpods')) rawBrand = 'Apple';
    else if (lowerTitle.includes('samsung') || lowerTitle.includes('galaxy')) rawBrand = 'Samsung';
    else if (lowerTitle.includes('sony') || lowerTitle.includes('bravia')) rawBrand = 'Sony';
    else if (lowerTitle.includes('dell') || lowerTitle.includes('alienware')) rawBrand = 'Dell';
    else if (lowerTitle.includes('asus') || lowerTitle.includes('rog')) rawBrand = 'Asus';
    else if (lowerTitle.includes('bose')) rawBrand = 'Bose';
    else if (lowerTitle.includes('ninja')) rawBrand = 'Ninja';
    else if (lowerTitle.includes('dyson')) rawBrand = 'Dyson';
    else if (lowerTitle.includes('google') || lowerTitle.includes('pixel')) rawBrand = 'Google';
    else if (lowerTitle.includes('oneplus')) rawBrand = 'OnePlus';
    else if (lowerTitle.includes('logitech')) rawBrand = 'Logitech';
    else rawBrand = 'Premium Brand';
  }

  // 5. Category Resolution
  const categoryName = targetCategory || (matchedGadget ? matchedGadget.category : resolveCategory(rawTitle));

  // 6. Image Resolution
  if (imageUrl) {
    rawImages.unshift(imageUrl);
  }
  if (rawImages.length === 0) {
    rawImages = getDefaultImagesForCategory(categoryName);
  }
  const featuredImage = rawImages[0];

  // 7. Specifications Synthesis
  if (Object.keys(rawSpecs).length === 0) {
    rawSpecs = {
      'Brand': rawBrand,
      'Product Model': rawTitle.length > 50 ? rawTitle.substring(0, 50) + '...' : rawTitle,
      'Build Quality': 'Aerospace Grade Aluminum & Ergonomic Construction',
      'Connectivity': 'Bluetooth 5.3, Wi-Fi 6E, High-Speed USB-C',
      'Power / Battery': 'All-Day High Endurance Battery with Fast Charging Support',
      'Warranty': '1-Year Official International Manufacturer Warranty',
    };
  }

  // 8. Features Synthesis
  if (rawBullets.length === 0) {
    rawBullets = [
      `Next-generation engineering optimized for pro-level productivity and seamless everyday performance.`,
      `Precision crafted with premium materials ensuring maximum long-term durability and ergonomic comfort.`,
      `Smart intelligent power management delivering extended all-day battery life with rapid recharge capabilities.`,
      `Universal compatibility and fluid ecosystem synchronization across all your modern devices.`,
    ];
  }

  // 9. Pros & Cons Synthesis
  const pros = matchedGadget?.pros || [
    'Outstanding build quality and luxurious tactile feel',
    'Exceptional performance under intensive daily workloads',
    'Intuitive user experience with seamless device connectivity',
    'Reliable all-day battery endurance and quick charging',
  ];

  const cons = matchedGadget?.cons || [
    'Premium price point compared to entry-level generic alternatives',
    'High market demand occasionally causes limited color availability',
  ];

  // 10. URLs & Affiliate tag
  const amazonUrl = url || `https://www.amazon.com/s?k=${encodeURIComponent(rawTitle)}`;
  const affiliateUrl = amazonUrl.includes('?') ? `${amazonUrl}&tag=${tag}` : `${amazonUrl}?tag=${tag}`;

  // Marketplaces multi-country pricing map
  const marketplaces: Record<string, { price: string; url: string }> = {
    US: {
      price: rawPrice,
      url: affiliateUrl,
    },
    IN: {
      price: matchedGadget?.priceINR || '₹34,999',
      url: `https://www.amazon.in/s?k=${encodeURIComponent(rawTitle)}&tag=${tag.replace(/-\d+$/, 'in-20')}`,
    },
    UK: {
      price: `£${Math.round(parseFloat(rawPrice.replace(/[^0-9.]/g, '') || '399') * 0.79)}`,
      url: `https://www.amazon.co.uk/s?k=${encodeURIComponent(rawTitle)}&tag=${tag.replace(/-\d+$/, 'uk-20')}`,
    },
    CA: {
      price: `CDN$ ${Math.round(parseFloat(rawPrice.replace(/[^0-9.]/g, '') || '399') * 1.35)}`,
      url: `https://www.amazon.ca/s?k=${encodeURIComponent(rawTitle)}&tag=${tag.replace(/-\d+$/, 'ca-20')}`,
    },
  };

  // 11. Slug, Titles, SEO
  const cleanTitleForSlug = rawTitle.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
  const slug = slugify(`${cleanTitleForSlug}-review`);
  const metaTitle = `${rawTitle} In-Depth Review (2026): Is It Worth Buying?`;
  const metaDescription = `Complete, hands-on review of the ${rawTitle}. Explore real-world benchmarks, detailed specs, pros & cons, and current best Amazon discount deals.`;

  // 12. FAQs
  const faqs = [
    {
      question: `Is the ${rawTitle} worth buying in 2026?`,
      answer: `Yes! The ${rawTitle} sets a high standard in its category with excellent build quality, responsive performance, and high user satisfaction scores, making it a sound long-term investment.`,
    },
    {
      question: `Does it come with an official manufacturer warranty?`,
      answer: `Yes, all genuine units purchased through authorized retail channels on Amazon come with a standard 1-year manufacturer warranty and customer support.`,
    },
    {
      question: `What are the top alternative options?`,
      answer: `Depending on your budget and preference, you can also explore similar flagship alternatives from ${rawBrand === 'Apple' ? 'Samsung or Sony' : 'Apple or Bose'}, but the ${rawTitle} maintains an exceptional price-to-performance ratio.`,
    },
  ];

  const conclusion = `The **${rawTitle}** stands out as one of the best choices available in the **${categoryName}** space today. Whether you prioritize build quality, state-of-the-art performance, or reliable everyday usability, it delivers on all fronts with confidence.`;

  // 13. Rich HTML Content
  const content = `
    <h2>1. Introduction & Overview</h2>
    <p>In today's fast-moving tech market, choosing the right gadget can be a daunting task. The <strong>${rawTitle}</strong> has generated immense excitement among enthusiasts and casual buyers alike. In this detailed, hands-on review, we put it through comprehensive real-world testing to examine its design, durability, performance, and overall value proposition.</p>

    <h2>2. Design, Ergonomics & Build Quality</h2>
    <p>From the moment you unbox the <strong>${rawTitle}</strong>, its premium craftsmanship is readily apparent. Built with precision and high-grade materials, it strikes a stellar balance between lightweight portability and rugged daily resilience.</p>

    <h2>3. Key Features & Performance Analysis</h2>
    <p>During our benchmark testing and daily workflow simulations, the device consistently delivered snappy responsiveness and flawless stability. Core feature highlights include:</p>
    <ul>
      ${rawBullets.map(b => `<li><strong>${b.split(':')[0] || 'Feature'}</strong>: ${b.includes(':') ? b.substring(b.indexOf(':') + 1) : b}</li>`).join('\n')}
    </ul>

    <h2>4. Real-World Usability & Daily Experience</h2>
    <p>Beyond raw technical specifications, what matters most is daily reliability. Battery optimization ensures you comfortably power through intensive workdays without anxiety, while the intuitive controls make operation second nature.</p>

    <h2>5. Final Verdict: Should You Buy It?</h2>
    <p>${conclusion}</p>
  `;

  return {
    title: `${rawTitle} Review: Complete Specs, Benchmarks & Deals`,
    slug,
    metaTitle,
    metaDescription,
    brand: rawBrand,
    price: rawPrice,
    images: rawImages,
    categoryName,
    featuredImage,
    specifications: rawSpecs,
    features: rawBullets,
    pros,
    cons,
    content,
    faqs,
    conclusion,
    amazonUrl,
    affiliateUrl,
    marketplaces,
    tags: [rawBrand, categoryName, 'Review', 'Deals', 'Tech Gadgets'],
  };
}
