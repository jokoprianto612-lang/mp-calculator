/**
 * Shared utility functions
 */

import type { Language } from './types';

/**
 * Generate a unique ID
 */
export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}${prefix ? '_' : ''}${timestamp}_${random}`;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Format number with Indonesian locale
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('id-ID', options).format(value);
}

/**
 * Format currency as IDR
 */
export function formatIDR(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 1): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format compact number (1.2K, 1.5M, etc.)
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}

/**
 * Parse IDR string to number
 */
export function parseIDR(value: string): number {
  return Number(value.replace(/[^0-9.-]/g, ''));
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; baseDelay?: number; maxDelay?: number } = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelay = 1000, maxDelay = 10000 } = options;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) break;
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

/**
 * Get supported languages
 */
export const SUPPORTED_LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
];

/**
 * Get language name by code
 */
export function getLanguageName(code: Language): string {
  return SUPPORTED_LANGUAGES.find(l => l.code === code)?.name ?? code;
}

/**
 * Get native language name by code
 */
export function getNativeLanguageName(code: Language): string {
  return SUPPORTED_LANGUAGES.find(l => l.code === code)?.nativeName ?? code;
}

/**
 * Category list for Indonesian marketplaces
 */
export const PRODUCT_CATEGORIES = [
  { id: 'electronics', name: 'Elektronik', nameEn: 'Electronics' },
  { id: 'fashion', name: 'Fashion', nameEn: 'Fashion' },
  { id: 'home', name: 'Rumah Tangga', nameEn: 'Home & Living' },
  { id: 'beauty', name: 'Kecantikan', nameEn: 'Beauty' },
  { id: 'health', name: 'Kesehatan', nameEn: 'Health' },
  { id: 'sports', name: 'Olahraga', nameEn: 'Sports' },
  { id: 'automotive', name: 'Otomotif', nameEn: 'Automotive' },
  { id: 'books', name: 'Buku', nameEn: 'Books' },
  { id: 'toys', name: 'Mainan', nameEn: 'Toys' },
  { id: 'food', name: 'Makanan & Minuman', nameEn: 'Food & Beverage' },
];

/**
 * Get category name by ID and locale
 */
export function getCategoryName(categoryId: string, locale: Language = 'id'): string {
  const category = PRODUCT_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return categoryId;
  return locale === 'id' ? category.name : category.nameEn;
}

/**
 * Marketplace display names
 */
export const MARKETPLACE_INFO = {
  tokopedia: { name: 'Tokopedia', color: '#00A651', logo: 'tokopedia' },
  shopee: { name: 'Shopee', color: '#EE4D2D', logo: 'shopee' },
  lazada: { name: 'Lazada', color: '#FF6B00', logo: 'lazada' },
  tiktok: { name: 'TikTok Shop', color: '#000000', logo: 'tiktok' },
} as const;

/**
 * Get marketplace display name
 */
export function getMarketplaceName(marketplace: string): string {
  return MARKETPLACE_INFO[marketplace as keyof typeof MARKETPLACE_INFO]?.name ?? marketplace;
}

/**
 * Get marketplace color
 */
export function getMarketplaceColor(marketplace: string): string {
  return MARKETPLACE_INFO[marketplace as keyof typeof MARKETPLACE_INFO]?.color ?? '#6366F1';
}

/**
 * Classnames utility (simple alternative to clsx)
 */
export function cn(...classes: (string | boolean | undefined | null | Record<string, boolean>)[]): string {
  return classes
    .flatMap(c => {
      if (typeof c === 'string') return c;
      if (typeof c === 'object' && c !== null) {
        return Object.entries(c)
          .filter(([, v]) => v)
          .map(([k]) => k);
      }
      return [];
    })
    .join(' ');
}

/**
 * Truncate string
 */
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Slugify string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if running in browser
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Get stored value from localStorage (browser only)
 */
export function getStored<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Set stored value in localStorage (browser only)
 */
export function setStored<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota exceeded errors
  }
}

/**
 * Remove stored value from localStorage (browser only)
 */
export function removeStored(key: string): void {
  if (!isBrowser) return;
  localStorage.removeItem(key);
}