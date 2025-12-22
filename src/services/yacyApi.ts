/**
 * YaCy P2P Search Engine API Service
 * ===================================
 *
 * This service provides integration with the YaCy decentralized search engine.
 * YaCy uses a P2P Kademlia DHT protocol for distributed search.
 *
 * @see http://localhost:8090 - YaCy Admin Interface
 * @see https://yacy.net - YaCy Documentation
 */

export interface YaCySearchResult {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
  size?: number;
  host?: string;
}

export interface YaCySearchResponse {
  channels: {
    title: string;
    description: string;
    totalResults: number;
    items: YaCySearchResult[];
  }[];
}

export interface YaCyStatus {
  name: string;
  version: string;
  uptime: string;
  memory: {
    used: number;
    max: number;
    percentage: number;
  };
  index: {
    documents: number;
    words: number;
  };
  network: {
    peers: number;
    juniorPeers: number;
    seniorPeers: number;
  };
}

export interface YaCyCrawlRequest {
  url: string;
  crawlingDepth?: number;
  crawlingMaxPages?: number;
  crawlerStoreHTCache?: boolean;
}

const YACY_BASE_URL = process.env.YACY_URL || 'http://localhost:8090';

/**
 * Search YaCy index
 */
export async function search(
  query: string,
  options: {
    resource?: 'local' | 'global';
    startRecord?: number;
    maximumRecords?: number;
    contentdom?: 'all' | 'text' | 'image' | 'video' | 'audio' | 'app';
  } = {}
): Promise<YaCySearchResponse> {
  const {
    resource = 'global',
    startRecord = 0,
    maximumRecords = 10,
    contentdom = 'all',
  } = options;

  const params = new URLSearchParams({
    query,
    resource,
    startRecord: startRecord.toString(),
    maximumRecords: maximumRecords.toString(),
    contentdom,
  });

  const response = await fetch(
    `${YACY_BASE_URL}/yacysearch.json?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`YaCy search failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get YaCy server status
 */
export async function getStatus(): Promise<YaCyStatus> {
  const response = await fetch(`${YACY_BASE_URL}/api/status_p.json`);

  if (!response.ok) {
    throw new Error(`Failed to get YaCy status: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    name: data.peerName || 'Unknown',
    version: data.version || 'Unknown',
    uptime: data.uptime || '0',
    memory: {
      used: data.memoryUsed || 0,
      max: data.memoryMax || 0,
      percentage: data.memoryUsedPercent || 0,
    },
    index: {
      documents: data.urlpublictextSize || 0,
      words: data.urlpublicwordSize || 0,
    },
    network: {
      peers: data.peerTotal || 0,
      juniorPeers: data.peerJunior || 0,
      seniorPeers: data.peerSenior || 0,
    },
  };
}

/**
 * Start a new crawl
 */
export async function startCrawl(request: YaCyCrawlRequest): Promise<{ success: boolean; message: string }> {
  const {
    url,
    crawlingDepth = 2,
    crawlingMaxPages = 1000,
    crawlerStoreHTCache = true,
  } = request;

  const params = new URLSearchParams({
    crawlingURL: url,
    crawlingDepth: crawlingDepth.toString(),
    crawlingMaxPages: crawlingMaxPages.toString(),
    crawlerStoreHTCache: crawlerStoreHTCache.toString(),
  });

  const response = await fetch(
    `${YACY_BASE_URL}/Crawler_p.json?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to start crawl: ${response.statusText}`);
  }

  return {
    success: true,
    message: `Crawl started for ${url}`,
  };
}

/**
 * Get network peers information
 */
export async function getNetworkPeers(): Promise<{
  total: number;
  active: number;
  passive: number;
  peers: Array<{ name: string; hash: string; lastSeen: string }>;
}> {
  const response = await fetch(`${YACY_BASE_URL}/api/network_p.json`);

  if (!response.ok) {
    throw new Error(`Failed to get network peers: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check if YaCy is running and accessible
 */
export async function isAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${YACY_BASE_URL}/`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get suggestions for search query (autocomplete)
 */
export async function getSuggestions(query: string): Promise<string[]> {
  const params = new URLSearchParams({ query });

  const response = await fetch(
    `${YACY_BASE_URL}/suggest.json?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to get suggestions: ${response.statusText}`);
  }

  const data = await response.json();
  return data.suggestions || [];
}

export const yacyApi = {
  search,
  getStatus,
  startCrawl,
  getNetworkPeers,
  isAvailable,
  getSuggestions,
};

export default yacyApi;
