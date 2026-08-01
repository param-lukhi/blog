import { slugify } from './utils';

export interface GeneratedBlogDraft {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  brand: string;
  price: string;
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
  tags: string[];
}

export function generateAmazonBlogDraft(amazonUrl: string, customTag?: string): GeneratedBlogDraft {
  // Extract ASIN or product hints from URL
  const asinMatch = amazonUrl.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  const asin = asinMatch ? asinMatch[1] : 'B08N5WRWNW';

  // Parse path for product keyword hints
  let titleHint = 'Premium Tech Gadget';
  if (amazonUrl.includes('iphone') || amazonUrl.includes('apple')) {
    titleHint = 'Apple iPhone 15 Pro Max (256GB, Titanium)';
  } else if (amazonUrl.includes('macbook') || amazonUrl.includes('laptop')) {
    titleHint = 'Apple MacBook Air M3 15-inch Laptop';
  } else if (amazonUrl.includes('sony') || amazonUrl.includes('wh-1000xm5') || amazonUrl.includes('earbuds')) {
    titleHint = 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones';
  } else if (amazonUrl.includes('tv') || amazonUrl.includes('samsung') || amazonUrl.includes('lg')) {
    titleHint = 'Samsung 65-Inch Class OLED 4K Smart TV';
  } else if (amazonUrl.includes('watch')) {
    titleHint = 'Apple Watch Series 9 GPS 45mm Smartwatch';
  } else if (amazonUrl.includes('kitchen') || amazonUrl.includes('air-fryer')) {
    titleHint = 'Ninja Foodi XL 6-in-1 DualZone Air Fryer';
  } else {
    // Generate a title based on clean URL tokens if possible
    const urlParts = amazonUrl.split('/');
    const productSlugPart = urlParts.find(p => p.includes('-') && !p.includes('amazon') && !p.includes('http'));
    if (productSlugPart) {
      titleHint = productSlugPart
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  }

  const brand = titleHint.startsWith('Apple') ? 'Apple' : titleHint.startsWith('Sony') ? 'Sony' : titleHint.startsWith('Samsung') ? 'Samsung' : titleHint.startsWith('Ninja') ? 'Ninja' : 'Premium Brand';
  const price = '$999.00';
  const slug = slugify(`${titleHint}-review`);
  
  // Format affiliate link with tag parameter
  const tag = customTag || 'myblog-20';
  const affiliateUrl = amazonUrl.includes('?') 
    ? `${amazonUrl}&tag=${tag}` 
    : `${amazonUrl}?tag=${tag}`;

  const specifications = {
    "Brand": brand,
    "Model Name": titleHint,
    "Display / Quality": "High Resolution Retina / OLED Display",
    "Battery Life": "Up to 24 Hours continuous use",
    "Connectivity": "Wi-Fi 6E, Bluetooth 5.3, USB-C",
    "Warranty": "1-Year Official Manufacturer Warranty"
  };

  const features = [
    "Industry-leading performance powered by next-generation chip technology.",
    "Ultra-sleek lightweight ergonomic design built with premium materials.",
    "Enhanced battery optimization delivering all-day power with fast charging support.",
    "Seamless ecosystem integration with multi-device synchronization."
  ];

  const pros = [
    "Exceptional build quality and premium aesthetics",
    "Outstanding performance under heavy daily workloads",
    "Intuitive controls and seamless user experience",
    "Fast charging and long battery endurance"
  ];

  const cons = [
    "Higher price point compared to entry-level alternatives",
    "Included accessories in box are minimal"
  ];

  const faqs = [
    {
      question: `Is the ${titleHint} worth buying in 2026?`,
      answer: `Absolutely! The ${titleHint} delivers exceptional value, top-tier performance, and long-term durability that easily justifies the investment.`
    },
    {
      question: "Does it come with an official warranty?",
      answer: "Yes, it includes a standard 1-year manufacturer warranty when purchased through authorized retailers on Amazon."
    },
    {
      question: "What is in the box?",
      answer: `The package includes the ${titleHint}, quick start documentation, safety guide, and standard charging cable.`
    }
  ];

  const conclusion = `If you are looking for a top-performing, reliable, and beautifully designed product in this class, the **${titleHint}** is an easy recommendation. It excels in build quality, speed, and overall user experience.`;

  const metaTitle = `${titleHint} Review (2026): Is It Worth Buying?`;
  const metaDescription = `Detailed hands-on review of the ${titleHint}. Check out full specs, pros, cons, performance test results, and current Amazon price deals.`;

  const content = `
    <h2>Introduction</h2>
    <p>Finding the perfect gadget or product can be overwhelming with so many options on the market. In this comprehensive review, we dive deep into the <strong>${titleHint}</strong> to evaluate its build quality, real-world performance, key specifications, and overall value for money.</p>

    <h2>Design & Build Quality</h2>
    <p>Right out of the box, the <strong>${titleHint}</strong> impresses with its refined craftsmanship. The sleek minimalist aesthetic feels extremely high-end, while the durable construction ensures longevity even with daily heavy use.</p>

    <h2>Key Performance & Features</h2>
    <p>During our extensive hands-on testing, the product delivered crisp responsiveness and seamless operation. Key highlights include:</p>
    <ul>
      ${features.map(f => `<li>${f}</li>`).join('\n')}
    </ul>

    <h2>Value & Final Verdict</h2>
    <p>${conclusion}</p>
  `;

  return {
    title: `${titleHint}: Complete Review & Best Deals`,
    slug,
    metaTitle,
    metaDescription,
    brand,
    price,
    categoryName: titleHint.toLowerCase().includes('phone') || titleHint.toLowerCase().includes('iphone') ? 'Mobiles' : titleHint.toLowerCase().includes('laptop') || titleHint.toLowerCase().includes('macbook') ? 'Laptops' : titleHint.toLowerCase().includes('tv') ? 'TVs' : titleHint.toLowerCase().includes('watch') ? 'Smart Watches' : 'Accessories',
    featuredImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
    specifications,
    features,
    pros,
    cons,
    content,
    faqs,
    conclusion,
    amazonUrl,
    affiliateUrl,
    tags: [brand, 'Review', 'Deals', 'Tech']
  };
}
