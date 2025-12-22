/**
 * SearXNG Meta Search Engine Service
 * ===================================
 *
 * This service provides integration with SearXNG, a privacy-respecting
 * meta search engine that aggregates results from multiple sources.
 *
 * @see http://localhost:8888 - SearXNG Interface
 * @see https://docs.searxng.org - SearXNG Documentation
 */

export interface SearXNGResult {
  title: string;
  url: string;
  content: string;
  engine: string;
  score: number;
  category: string;
  pretty_url?: string;
  publishedDate?: string;
  thumbnail?: string;
}

export interface SearXNGSearchResponse {
  query: string;
  results: SearXNGResult[];
  suggestions: string[];
  answers: string[];
  infoboxes: Array<{
    infobox: string;
    id: string;
    content: string;
    urls: Array<{ title: string; url: string }>;
  }>;
  number_of_results: number;
}

export interface SearXNGEngineInfo {
  name: string;
  enabled: boolean;
  categories: string[];
  supported_languages: string[];
}

const SEARXNG_BASE_URL = process.env.SEARXNG_URL || 'http://localhost:8888';

/**
 * Search using SearXNG meta search
 */
export async function search(
  query: string,
  options: {
    categories?: string[];
    engines?: string[];
    language?: string;
    pageno?: number;
    time_range?: 'day' | 'week' | 'month' | 'year';
    safesearch?: 0 | 1 | 2;
  } = {}
): Promise<SearXNGSearchResponse> {
  const {
    categories = [],
    engines = [],
    language = 'de',
    pageno = 1,
    time_range,
    safesearch = 1,
  } = options;

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    language,
    pageno: pageno.toString(),
    safesearch: safesearch.toString(),
  });

  if (categories.length > 0) {
    params.set('categories', categories.join(','));
  }
  if (engines.length > 0) {
    params.set('engines', engines.join(','));
  }
  if (time_range) {
    params.set('time_range', time_range);
  }

  const response = await fetch(
    `${SEARXNG_BASE_URL}/search?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`SearXNG search failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get available categories
 */
export function getCategories(): string[] {
  return [
    'general',
    'images',
    'videos',
    'news',
    'map',
    'music',
    'it',
    'science',
    'files',
    'social media',
  ];
}

/**
 * Get search suggestions/autocomplete
 */
export async function getAutocomplete(query: string): Promise<string[]> {
  const params = new URLSearchParams({
    q: query,
  });

  const response = await fetch(
    `${SEARXNG_BASE_URL}/autocompleter?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to get autocomplete: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check if SearXNG is running and accessible
 */
export async function isAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${SEARXNG_BASE_URL}/`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Search images specifically
 */
export async function searchImages(
  query: string,
  options: { pageno?: number } = {}
): Promise<SearXNGSearchResponse> {
  return search(query, {
    ...options,
    categories: ['images'],
  });
}

/**
 * Search news specifically
 */
export async function searchNews(
  query: string,
  options: { pageno?: number; time_range?: 'day' | 'week' | 'month' | 'year' } = {}
): Promise<SearXNGSearchResponse> {
  return search(query, {
    ...options,
    categories: ['news'],
  });
}

/**
 * Search videos specifically
 */
export async function searchVideos(
  query: string,
  options: { pageno?: number } = {}
): Promise<SearXNGSearchResponse> {
  return search(query, {
    ...options,
    categories: ['videos'],
  });
}

export const searxngService = {
  search,
  getCategories,
  getAutocomplete,
  isAvailable,
  searchImages,
  searchNews,
  searchVideos,
};

export default searxngService;
