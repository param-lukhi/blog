import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-');      // Replace multiple - with single -
}

export function safeJsonParse<T>(val: any, fallback: T): T {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val !== 'string') {
    return val as T;
  }

  try {
    let parsed = JSON.parse(val);
    let safetyCounter = 0;
    while (typeof parsed === 'string' && safetyCounter < 5) {
      safetyCounter++;
      try {
        const next = JSON.parse(parsed);
        parsed = next;
      } catch {
        break;
      }
    }

    if (parsed === null || parsed === undefined) {
      return fallback;
    }

    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      if (typeof parsed === 'string' && parsed.trim()) {
        return parsed.split(',').map((s: string) => s.trim()).filter(Boolean) as unknown as T;
      }
      return fallback;
    }

    if (
      fallback !== null &&
      typeof fallback === 'object' &&
      !Array.isArray(fallback) &&
      (typeof parsed !== 'object' || Array.isArray(parsed))
    ) {
      return fallback;
    }

    return parsed as T;
  } catch (e) {
    if (Array.isArray(fallback) && typeof val === 'string' && val.trim()) {
      return val.split(',').map((s: string) => s.trim()).filter(Boolean) as unknown as T;
    }
    return fallback;
  }
}

export function formatPrice(price: string | number): string {
  if (typeof price === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }
  if (!price) return '$0.00';
  if (price.startsWith('$') || price.startsWith('₹') || price.startsWith('€') || price.startsWith('£')) {
    return price;
  }
  return `$${price}`;
}

export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function estimateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}
