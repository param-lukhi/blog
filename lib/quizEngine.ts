export interface QuizAnswers {
  budget: 'under_10k' | '10k_25k' | '25k_50k' | '50k_plus' | 'any';
  useCase: 'daily' | 'gaming' | 'productivity' | 'travel' | 'fitness' | 'content_creation' | 'general';
  priorityFeature: 'battery' | 'camera' | 'performance' | 'sound' | 'design' | 'durability' | 'value';
  categorySlug?: string;
  brand?: string;
}

export interface QuizMatchResult {
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    price: string;
    images: string;
    features: string;
    pros: string;
    cons: string;
    affiliateUrl: string;
    amazonUrl: string;
    category?: { name: string; slug: string } | null;
    prices?: Array<{ storeName: string; storeSlug: string; price: number | null; affiliateUrl: string | null }>;
  };
  matchScore: number; // 0 to 100
  matchReasons: string[];
}

export function matchProductsToQuiz(
  products: any[],
  answers: QuizAnswers
): QuizMatchResult[] {
  const results: QuizMatchResult[] = [];

  for (const prod of products) {
    let score = 0;
    const reasons: string[] = [];

    // Parse numeric price from product.price or lowest product.prices
    let numericPrice = 0;
    if (prod.prices && prod.prices.length > 0) {
      const validPrices = prod.prices
        .map((p: any) => p.price)
        .filter((p: any) => typeof p === 'number' && p > 0);
      if (validPrices.length > 0) {
        numericPrice = Math.min(...validPrices);
      }
    }
    if (!numericPrice) {
      const rawPriceMatch = String(prod.price || '').replace(/[^0-9.]/g, '');
      numericPrice = parseFloat(rawPriceMatch) || 0;
    }

    // 1. Budget Match
    let budgetMatches = false;
    if (answers.budget === 'under_10k') {
      if (numericPrice > 0 && numericPrice <= 10000) {
        budgetMatches = true;
        score += 30;
        reasons.push(`Affordable & fits within your budget (₹${numericPrice.toLocaleString()})`);
      }
    } else if (answers.budget === '10k_25k') {
      if (numericPrice >= 9000 && numericPrice <= 26000) {
        budgetMatches = true;
        score += 30;
        reasons.push(`Comfortably in your ₹10k–₹25k target range (₹${numericPrice.toLocaleString()})`);
      }
    } else if (answers.budget === '25k_50k') {
      if (numericPrice >= 24000 && numericPrice <= 52000) {
        budgetMatches = true;
        score += 30;
        reasons.push(`Mid-to-premium tier in your ₹25k–₹50k budget (₹${numericPrice.toLocaleString()})`);
      }
    } else if (answers.budget === '50k_plus') {
      if (numericPrice >= 48000) {
        budgetMatches = true;
        score += 30;
        reasons.push(`Flagship tier matching your premium budget requirement (₹${numericPrice.toLocaleString()})`);
      }
    } else {
      score += 15;
    }

    // 2. Category Match
    if (answers.categorySlug && answers.categorySlug !== 'all') {
      const catSlug = prod.category?.slug || '';
      if (catSlug.toLowerCase().includes(answers.categorySlug.toLowerCase())) {
        score += 25;
        reasons.push(`Matches your requested category (${prod.category?.name || answers.categorySlug})`);
      }
    }

    // 3. Use Case Match
    const combinedContent = `${prod.name} ${prod.features || ''} ${prod.specifications || ''} ${prod.pros || ''}`.toLowerCase();
    
    const useCaseKeywords: Record<string, string[]> = {
      daily: ['everyday', 'daily', 'versatile', 'general', 'compact', 'easy'],
      gaming: ['gaming', 'latency', 'refresh rate', 'gpu', 'fps', 'audio latency', 'rgb'],
      productivity: ['battery', 'multitask', 'display', 'keyboard', 'office', 'fast charging', 'work'],
      travel: ['noise cancelling', 'anc', 'portable', 'lightweight', 'compact', 'battery life'],
      fitness: ['waterproof', 'ipx', 'sweat', 'grip', 'lightweight', 'workout', 'sports'],
      content_creation: ['camera', 'sensor', 'mic', 'microphone', 'color', 'display', 'resolution', '4k'],
      general: ['balanced', 'reliable', 'popular', 'quality'],
    };

    const targetKeywords = useCaseKeywords[answers.useCase] || [];
    let useCaseMatches = targetKeywords.filter((kw) => combinedContent.includes(kw));
    if (useCaseMatches.length > 0) {
      score += 25;
      reasons.push(`Suited for ${answers.useCase} usage based on verified specifications`);
    }

    // 4. Priority Feature Match
    const featureKeywords: Record<string, string[]> = {
      battery: ['battery', 'mah', 'hours', 'endurance', 'fast charge', 'standby'],
      camera: ['camera', 'sensor', 'megapixels', 'mp', 'lens', 'night mode', 'hdr'],
      performance: ['processor', 'chip', 'ram', 'speed', 'snapdragon', 'bionic', 'octa-core'],
      sound: ['driver', 'bass', 'audio', 'codec', 'anc', 'surround', 'dolby'],
      design: ['aluminum', 'premium', 'glass', 'sleek', 'slim', 'matte', 'finish'],
      durability: ['ip68', 'gorilla glass', 'rugged', 'waterproof', 'warranty', 'sturdy'],
      value: ['value', 'deal', 'discount', 'budget', 'affordable'],
    };

    const targetFeatureKws = featureKeywords[answers.priorityFeature] || [];
    let featureMatches = targetFeatureKws.filter((kw) => combinedContent.includes(kw));
    if (featureMatches.length > 0) {
      score += 20;
      reasons.push(`Highlights your priority requirement (${answers.priorityFeature})`);
    }

    // 5. Brand Match
    if (answers.brand && answers.brand !== 'any') {
      if (prod.brand.toLowerCase() === answers.brand.toLowerCase()) {
        score += 15;
        reasons.push(`From your preferred brand: ${prod.brand}`);
      }
    }

    // Include if it meets reasonable relevance
    if (score >= 25 || budgetMatches) {
      if (reasons.length === 0) {
        reasons.push('Reliable verified product in our research catalog');
      }

      results.push({
        product: prod,
        matchScore: Math.min(score, 100),
        matchReasons: reasons,
      });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);
}
