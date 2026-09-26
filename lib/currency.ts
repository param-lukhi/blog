/**
 * Multi-Currency Support for BlogWeb904 (Phase 4)
 * Supports INR, USD, GBP, EUR with safe conversion, original price preservation,
 * and reliable exchange rate mechanisms.
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  formatPrefix: boolean;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', formatPrefix: true },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', formatPrefix: true },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', formatPrefix: true },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', formatPrefix: true },
};

// Base exchange rates against USD (fallback when live API is unavailable)
// Updated baseline reference rates
export const BASE_EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  INR: 83.5,
  GBP: 0.79,
  EUR: 0.92,
};

export interface ConversionResult {
  originalPrice: number;
  originalCurrency: string;
  convertedPrice: number;
  targetCurrency: string;
  formattedOriginal: string;
  formattedConverted: string;
  isApproximate: boolean;
  rateUsed: number;
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number | null | undefined, currency = 'INR'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Check price';
  }

  const curr = SUPPORTED_CURRENCIES[currency.toUpperCase()] || {
    symbol: currency,
    formatPrefix: true,
  };

  const formattedNum = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return `${curr.symbol}${formattedNum}`;
}

/**
 * Convert price between supported currencies without altering source price in database
 */
export function convertCurrency(
  amount: number | null | undefined,
  fromCurrency = 'INR',
  toCurrency = 'INR',
  customRates?: Record<string, number>
): ConversionResult | null {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return null;
  }

  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  const rates = customRates || BASE_EXCHANGE_RATES;

  if (from === to) {
    const formatted = formatCurrency(amount, from);
    return {
      originalPrice: amount,
      originalCurrency: from,
      convertedPrice: amount,
      targetCurrency: to,
      formattedOriginal: formatted,
      formattedConverted: formatted,
      isApproximate: false,
      rateUsed: 1.0,
    };
  }

  const fromRateToUSD = rates[from] || 1.0;
  const toRateToUSD = rates[to] || 1.0;

  // Convert from -> USD -> to
  const amountInUSD = amount / fromRateToUSD;
  const convertedAmount = amountInUSD * toRateToUSD;
  const effectiveRate = toRateToUSD / fromRateToUSD;

  return {
    originalPrice: amount,
    originalCurrency: from,
    convertedPrice: Math.round(convertedAmount * 100) / 100,
    targetCurrency: to,
    formattedOriginal: formatCurrency(amount, from),
    formattedConverted: formatCurrency(convertedAmount, to),
    isApproximate: true,
    rateUsed: effectiveRate,
  };
}
