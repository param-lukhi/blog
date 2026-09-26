/**
 * Store Adapter Architecture for BlogWeb904 (Phase 4)
 * Provides standardized interface for Multi-Store price synchronization & affiliate verification.
 * 
 * Rules:
 * 1. Clearly indicates status: SUPPORTED | NOT_CONFIGURED | UNAVAILABLE.
 * 2. NEVER invents fake prices or fake API responses.
 * 3. Never exposes private secrets to client-side.
 */

export type AdapterStatus = 'SUPPORTED' | 'NOT_CONFIGURED' | 'UNAVAILABLE';

export interface PriceVerifyResult {
  success: boolean;
  price?: number;
  originalPrice?: number;
  currency: string;
  discount?: number;
  inStock: boolean;
  couponCode?: string;
  offerText?: string;
  source: string;
  error?: string;
  isSimulatedFallback?: boolean;
}

export interface AffiliateValidationResult {
  isValid: boolean;
  domain: string;
  isHttps: boolean;
  hasAffiliateParam: boolean;
  affiliateTagFound?: string;
  storeSlug: string;
  reason?: string;
}

export abstract class StoreAdapter {
  abstract readonly slug: string;
  abstract readonly name: string;
  abstract readonly domainPattern: RegExp;
  abstract readonly expectedParamKey?: string;

  abstract getStatus(): { status: AdapterStatus; reason?: string };

  abstract validateUrl(url: string): AffiliateValidationResult;

  /**
   * Verify price using official API / feed / direct check.
   * If credentials not configured, returns error result without fabricating data.
   */
  abstract fetchPrice(productUrl: string): Promise<PriceVerifyResult>;
}

/**
 * Amazon Store Adapter
 */
export class AmazonAdapter extends StoreAdapter {
  readonly slug = 'amazon';
  readonly name = 'Amazon';
  readonly domainPattern = /^https?:\/\/(www\.)?(amazon\.(com|in|co\.uk|de|fr|ca|com\.au|es|it|co\.jp)|amzn\.to)\//i;
  readonly expectedParamKey = 'tag';

  getStatus(): { status: AdapterStatus; reason?: string } {
    const hasTag = Boolean(
      process.env.AMAZON_ASSOCIATE_TAG ||
      process.env.NEXT_PUBLIC_DEFAULT_AFFILIATE_TAG
    );
    const hasApiKeys = Boolean(
      process.env.AMAZON_PAAPI_KEY && process.env.AMAZON_PAAPI_SECRET
    );

    if (!hasTag) {
      return {
        status: 'NOT_CONFIGURED',
        reason: 'Amazon Associate Tag not configured in environment (AMAZON_ASSOCIATE_TAG / NEXT_PUBLIC_DEFAULT_AFFILIATE_TAG)',
      };
    }

    if (!hasApiKeys) {
      return {
        status: 'NOT_CONFIGURED',
        reason: 'Amazon Product Advertising API credentials missing. Manual verification or live verified feed required.',
      };
    }

    return { status: 'SUPPORTED' };
  }

  validateUrl(url: string): AffiliateValidationResult {
    if (!url || typeof url !== 'string') {
      return {
        isValid: false,
        domain: '',
        isHttps: false,
        hasAffiliateParam: false,
        storeSlug: this.slug,
        reason: 'Empty or invalid URL string',
      };
    }

    const trimmed = url.trim();
    const isHttps = trimmed.startsWith('https://');
    const isDomainMatch = this.domainPattern.test(trimmed);

    let hasAffiliateParam = false;
    let affiliateTagFound: string | undefined;

    try {
      const parsed = new URL(trimmed);
      const tagParam = parsed.searchParams.get(this.expectedParamKey);
      if (tagParam) {
        hasAffiliateParam = true;
        affiliateTagFound = tagParam;
      } else if (trimmed.includes('amzn.to/')) {
        // Shortened official Amazon affiliate link
        hasAffiliateParam = true;
        affiliateTagFound = 'amzn.to_shortlink';
      }
    } catch {
      return {
        isValid: false,
        domain: '',
        isHttps: false,
        hasAffiliateParam: false,
        storeSlug: this.slug,
        reason: 'Malformed URL format',
      };
    }

    const isValid = isHttps && isDomainMatch;
    const reason = !isHttps
      ? 'URL must use HTTPS protocol'
      : !isDomainMatch
      ? 'Domain does not match Amazon'
      : !hasAffiliateParam
      ? 'Missing Amazon Associate tag parameter ("tag=" or amzn.to shortlink)'
      : undefined;

    return {
      isValid,
      domain: 'amazon',
      isHttps,
      hasAffiliateParam,
      affiliateTagFound,
      storeSlug: this.slug,
      reason,
    };
  }

  async fetchPrice(productUrl: string): Promise<PriceVerifyResult> {
    const { status, reason } = this.getStatus();
    if (status !== 'SUPPORTED') {
      return {
        success: false,
        currency: 'INR',
        inStock: false,
        source: 'Amazon API',
        error: reason || 'Amazon API credentials missing. Live data unavailable.',
      };
    }

    // When PAAPI credentials are configured, execute PAAPI lookup here
    return {
      success: false,
      currency: 'INR',
      inStock: false,
      source: 'Amazon PAAPI',
      error: 'Data unavailable. Check current price.',
    };
  }
}

/**
 * Flipkart Store Adapter
 */
export class FlipkartAdapter extends StoreAdapter {
  readonly slug = 'flipkart';
  readonly name = 'Flipkart';
  readonly domainPattern = /^https?:\/\/(www\.)?(flipkart\.com|fkrt\.it|dl\.flipkart\.com)\//i;
  readonly expectedParamKey = 'affid';

  getStatus(): { status: AdapterStatus; reason?: string } {
    const hasKeys = Boolean(process.env.FLIPKART_AFFILIATE_ID && process.env.FLIPKART_AFFILIATE_TOKEN);
    if (!hasKeys) {
      return {
        status: 'NOT_CONFIGURED',
        reason: 'Flipkart Affiliate API credentials missing (FLIPKART_AFFILIATE_ID / FLIPKART_AFFILIATE_TOKEN)',
      };
    }
    return { status: 'SUPPORTED' };
  }

  validateUrl(url: string): AffiliateValidationResult {
    if (!url || typeof url !== 'string') {
      return {
        isValid: false,
        domain: '',
        isHttps: false,
        hasAffiliateParam: false,
        storeSlug: this.slug,
        reason: 'Empty or invalid URL string',
      };
    }

    const trimmed = url.trim();
    const isHttps = trimmed.startsWith('https://');
    const isDomainMatch = this.domainPattern.test(trimmed);

    let hasAffiliateParam = false;
    let affiliateTagFound: string | undefined;

    try {
      const parsed = new URL(trimmed);
      const tagParam = parsed.searchParams.get(this.expectedParamKey) || parsed.searchParams.get('affExtParam1');
      if (tagParam) {
        hasAffiliateParam = true;
        affiliateTagFound = tagParam;
      } else if (trimmed.includes('fkrt.it/')) {
        hasAffiliateParam = true;
        affiliateTagFound = 'fkrt.it_shortlink';
      }
    } catch {
      return {
        isValid: false,
        domain: '',
        isHttps: false,
        hasAffiliateParam: false,
        storeSlug: this.slug,
        reason: 'Malformed URL format',
      };
    }

    const isValid = isHttps && isDomainMatch;
    const reason = !isHttps
      ? 'URL must use HTTPS protocol'
      : !isDomainMatch
      ? 'Domain does not match Flipkart'
      : !hasAffiliateParam
      ? 'Missing Flipkart Affiliate parameter ("affid=" or fkrt.it shortlink)'
      : undefined;

    return {
      isValid,
      domain: 'flipkart',
      isHttps,
      hasAffiliateParam,
      affiliateTagFound,
      storeSlug: this.slug,
      reason,
    };
  }

  async fetchPrice(productUrl: string): Promise<PriceVerifyResult> {
    const { status, reason } = this.getStatus();
    if (status !== 'SUPPORTED') {
      return {
        success: false,
        currency: 'INR',
        inStock: false,
        source: 'Flipkart API',
        error: reason || 'Flipkart Affiliate API not configured.',
      };
    }

    return {
      success: false,
      currency: 'INR',
      inStock: false,
      source: 'Flipkart API',
      error: 'Data unavailable. Check current price.',
    };
  }
}

/**
 * Croma Store Adapter
 */
export class CromaAdapter extends StoreAdapter {
  readonly slug = 'croma';
  readonly name = 'Croma';
  readonly domainPattern = /^https?:\/\/(www\.)?croma\.com\//i;
  readonly expectedParamKey = 'utm_source';

  getStatus(): { status: AdapterStatus; reason?: string } {
    const hasKeys = Boolean(process.env.CROMA_AFFILIATE_TAG || process.env.CROMA_FEED_API_KEY);
    if (!hasKeys) {
      return {
        status: 'NOT_CONFIGURED',
        reason: 'Croma Affiliate Tag or Feed credentials missing (CROMA_AFFILIATE_TAG / CROMA_FEED_API_KEY)',
      };
    }
    return { status: 'SUPPORTED' };
  }

  validateUrl(url: string): AffiliateValidationResult {
    if (!url || typeof url !== 'string') {
      return {
        isValid: false,
        domain: '',
        isHttps: false,
        hasAffiliateParam: false,
        storeSlug: this.slug,
        reason: 'Empty or invalid URL',
      };
    }

    const trimmed = url.trim();
    const isHttps = trimmed.startsWith('https://');
    const isDomainMatch = this.domainPattern.test(trimmed);

    let hasAffiliateParam = false;
    let affiliateTagFound: string | undefined;

    try {
      const parsed = new URL(trimmed);
      const tag = parsed.searchParams.get('utm_source') || parsed.searchParams.get('aff_tag');
      if (tag) {
        hasAffiliateParam = true;
        affiliateTagFound = tag;
      }
    } catch {
      return {
        isValid: false,
        domain: '',
        isHttps: false,
        hasAffiliateParam: false,
        storeSlug: this.slug,
        reason: 'Malformed URL format',
      };
    }

    return {
      isValid: isHttps && isDomainMatch,
      domain: 'croma',
      isHttps,
      hasAffiliateParam,
      affiliateTagFound,
      storeSlug: this.slug,
      reason: !isHttps ? 'HTTPS required' : !isDomainMatch ? 'Domain does not match Croma' : undefined,
    };
  }

  async fetchPrice(productUrl: string): Promise<PriceVerifyResult> {
    const { status, reason } = this.getStatus();
    return {
      success: false,
      currency: 'INR',
      inStock: false,
      source: 'Croma Adapter',
      error: status === 'NOT_CONFIGURED' ? reason : 'Data unavailable. Check current price.',
    };
  }
}

/**
 * Official Brand Store Adapter
 */
export class OfficialStoreAdapter extends StoreAdapter {
  readonly slug = 'brand-store';
  readonly name = 'Official Brand Store';
  readonly domainPattern = /^https?:\/\//i;
  readonly expectedParamKey = undefined;

  getStatus(): { status: AdapterStatus; reason?: string } {
    return {
      status: 'SUPPORTED',
      reason: 'Official brand stores use direct landing pages or merchant partner URLs.',
    };
  }

  validateUrl(url: string): AffiliateValidationResult {
    if (!url || typeof url !== 'string') {
      return {
        isValid: false,
        domain: '',
        isHttps: false,
        hasAffiliateParam: false,
        storeSlug: this.slug,
        reason: 'Empty URL',
      };
    }

    const trimmed = url.trim();
    const isHttps = trimmed.startsWith('https://');

    return {
      isValid: isHttps,
      domain: 'official-brand',
      isHttps,
      hasAffiliateParam: true,
      storeSlug: this.slug,
      reason: !isHttps ? 'Official store URLs must use HTTPS' : undefined,
    };
  }

  async fetchPrice(productUrl: string): Promise<PriceVerifyResult> {
    return {
      success: false,
      currency: 'INR',
      inStock: false,
      source: 'Brand Store',
      error: 'Data unavailable. Check current price.',
    };
  }
}

// Registry of adapters
export const storeAdapters: Record<string, StoreAdapter> = {
  amazon: new AmazonAdapter(),
  flipkart: new FlipkartAdapter(),
  croma: new CromaAdapter(),
  'brand-store': new OfficialStoreAdapter(),
};

/**
 * Get adapter by store slug
 */
export function getStoreAdapter(storeSlug: string): StoreAdapter | null {
  const normalized = storeSlug.toLowerCase().trim();
  if (normalized.includes('amazon')) return storeAdapters.amazon;
  if (normalized.includes('flipkart')) return storeAdapters.flipkart;
  if (normalized.includes('croma')) return storeAdapters.croma;
  if (normalized.includes('brand') || normalized.includes('official')) return storeAdapters['brand-store'];
  return storeAdapters[normalized] || null;
}

/**
 * Validate any affiliate URL with store detection
 */
export function validateAffiliateUrl(url: string, storeSlug?: string): AffiliateValidationResult {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      domain: '',
      isHttps: false,
      hasAffiliateParam: false,
      storeSlug: storeSlug || 'unknown',
      reason: 'URL is required',
    };
  }

  const adapter = storeSlug ? getStoreAdapter(storeSlug) : null;
  if (adapter) {
    return adapter.validateUrl(url);
  }

  // Generic validation
  const trimmed = url.trim();
  const isHttps = trimmed.startsWith('https://');
  try {
    const parsed = new URL(trimmed);
    return {
      isValid: isHttps,
      domain: parsed.hostname,
      isHttps,
      hasAffiliateParam: Boolean(parsed.search),
      storeSlug: 'generic',
      reason: !isHttps ? 'HTTPS required' : undefined,
    };
  } catch {
    return {
      isValid: false,
      domain: '',
      isHttps: false,
      hasAffiliateParam: false,
      storeSlug: 'generic',
      reason: 'Invalid URL format',
    };
  }
}
