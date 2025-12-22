/**
 * Decentralized Search Service
 * ============================
 *
 * Unified interface for decentralized and privacy-respecting search engines.
 * Combines YaCy P2P search and SearXNG meta search capabilities.
 */

import { yacyApi, YaCySearchResult, YaCySearchResponse } from './yacyApi';
import { searxngService, SearXNGResult, SearXNGSearchResponse } from './searxngService';

export interface UnifiedSearchResult {
  title: string;
  url: string;
  description: string;
  source: 'yacy' | 'searxng';
  score?: number;
  category?: string;
  publishedDate?: string;
}

export interface UnifiedSearchResponse {
  query: string;
  totalResults: number;
  results: UnifiedSearchResult[];
  sources: {
    yacy: boolean;
    searxng: boolean;
  };
}

export interface ServiceStatus {
  yacy: {
    available: boolean;
    version?: string;
    peers?: number;
    documents?: number;
  };
  searxng: {
    available: boolean;
  };
}

/**
 * Search across all available decentralized search engines
 */
export async function unifiedSearch(
  query: string,
  options: {
    useYacy?: boolean;
    useSearxng?: boolean;
    maxResults?: number;
  } = {}
): Promise<UnifiedSearchResponse> {
  const { useYacy = true, useSearxng = true, maxResults = 20 } = options;

  const results: UnifiedSearchResult[] = [];
  const sources = { yacy: false, searxng: false };

  // Parallel search across engines
  const searchPromises: Promise<void>[] = [];

  if (useYacy) {
    searchPromises.push(
      yacyApi
        .search(query, { maximumRecords: maxResults })
        .then((response: YaCySearchResponse) => {
          sources.yacy = true;
          if (response.channels?.[0]?.items) {
            response.channels[0].items.forEach((item: YaCySearchResult) => {
              results.push({
                title: item.title,
                url: item.link,
                description: item.description,
                source: 'yacy',
                publishedDate: item.pubDate,
              });
            });
          }
        })
        .catch(() => {
          // YaCy not available, continue without it
        })
    );
  }

  if (useSearxng) {
    searchPromises.push(
      searxngService
        .search(query, { pageno: 1 })
        .then((response: SearXNGSearchResponse) => {
          sources.searxng = true;
          response.results.slice(0, maxResults).forEach((item: SearXNGResult) => {
            results.push({
              title: item.title,
              url: item.url,
              description: item.content,
              source: 'searxng',
              score: item.score,
              category: item.category,
              publishedDate: item.publishedDate,
            });
          });
        })
        .catch(() => {
          // SearXNG not available, continue without it
        })
    );
  }

  await Promise.all(searchPromises);

  // Sort by relevance (prioritize items with higher scores)
  results.sort((a, b) => (b.score || 0) - (a.score || 0));

  return {
    query,
    totalResults: results.length,
    results: results.slice(0, maxResults),
    sources,
  };
}

/**
 * Get status of all search services
 */
export async function getServicesStatus(): Promise<ServiceStatus> {
  const [yacyAvailable, searxngAvailable] = await Promise.all([
    yacyApi.isAvailable(),
    searxngService.isAvailable(),
  ]);

  const status: ServiceStatus = {
    yacy: { available: yacyAvailable },
    searxng: { available: searxngAvailable },
  };

  // Get additional YaCy details if available
  if (yacyAvailable) {
    try {
      const yacyStatus = await yacyApi.getStatus();
      status.yacy = {
        ...status.yacy,
        version: yacyStatus.version,
        peers: yacyStatus.network.peers,
        documents: yacyStatus.index.documents,
      };
    } catch {
      // Ignore errors fetching detailed status
    }
  }

  return status;
}

/**
 * Algorithm-free platform alternatives
 */
export const algorithmFreeAlternatives = {
  youtube: [
    { name: 'Invidious (yewtu.be)', url: 'https://yewtu.be' },
    { name: 'Invidious (puffyan)', url: 'https://vid.puffyan.us' },
    { name: 'Invidious (kavin)', url: 'https://invidious.kavin.rocks' },
  ],
  twitter: [
    { name: 'Nitter', url: 'https://nitter.net' },
    { name: 'Nitter (42l)', url: 'https://nitter.42l.fr' },
    { name: 'Nitter (pussthecat)', url: 'https://nitter.pussthecat.org' },
  ],
  reddit: [
    { name: 'LibReddit (kavin)', url: 'https://libreddit.kavin.rocks' },
    { name: 'LibReddit', url: 'https://libredd.it' },
    { name: 'LibReddit (spike)', url: 'https://libreddit.spike.codes' },
  ],
  maps: [
    { name: 'OpenStreetMap', url: 'https://openstreetmap.org' },
  ],
} as const;

/**
 * Get algorithm-free URL for a platform
 */
export function getAlgorithmFreeUrl(
  platform: keyof typeof algorithmFreeAlternatives
): string {
  const alternatives = algorithmFreeAlternatives[platform];
  return alternatives[0].url;
}

export const decentralSearch = {
  unifiedSearch,
  getServicesStatus,
  algorithmFreeAlternatives,
  getAlgorithmFreeUrl,
  yacy: yacyApi,
  searxng: searxngService,
};

export default decentralSearch;
