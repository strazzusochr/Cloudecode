// YaCy API Service - Fetches real data from YaCy Search Server
// Documentation: https://wiki.yacy.net/index.php/Dev:API

export interface YaCyStatus {
    peerCount: number
    documentsIndexed: number
    queriesPerMinute: number
    uptime: number
    memory: {
        used: number
        max: number
    }
    version: string
    networkName: string
    peerType: string
}

export interface YaCyPeer {
    hash: string
    name: string
    type: 'senior' | 'principal' | 'junior' | 'virgin'
    lastSeen: number
    speed: number
    links: number
    words: number
    ppm: number // Pages per minute
    qph: number // Queries per hour
    version: string
    location?: {
        country: string
        city?: string
        lat?: number
        lon?: number
    }
}

export interface YaCySearchResult {
    title: string
    link: string
    description: string
    pubDate?: string
    size?: number
    mimetype?: string
    host: string
    path: string
    ranking?: number
}

export interface YaCySearchResponse {
    channels: Array<{
        title: string
        description: string
        totalResults: number
        startIndex: number
        itemsPerPage: number
        searchTerms: string
        items: YaCySearchResult[]
    }>
    totalResults: number
    searchTime: number
}

export interface YaCyCrawlStatus {
    urlsActive: number
    urlsPending: number
    urlsProcessed: number
    ppm: number // pages per minute
    isRunning: boolean
}

// Configuration - Update these values based on your setup
const config = {
    // Default YaCy port is 8090
    baseUrl: import.meta.env?.VITE_YACY_URL || '/yacy-api',
    timeout: 10000,
    defaultResultCount: 100
}

// Helper function for API requests with timeout
async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = config.timeout
): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                ...options.headers
            }
        })
        clearTimeout(timeoutId)
        return response
    } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeout}ms`)
        }
        throw error
    }
}

// Check if YaCy is online and reachable
export async function isYaCyOnline(): Promise<boolean> {
    try {
        const response = await fetchWithTimeout(
            `${config.baseUrl}/`,
            { method: 'HEAD' },
            5000
        )
        return response.ok
    } catch {
        return false
    }
}

// Fetch YaCy server status
export async function fetchYaCyStatus(): Promise<YaCyStatus | null> {
    try {
        const response = await fetchWithTimeout(
            `${config.baseUrl}/api/status_p.json`
        )

        if (!response.ok) {
            console.error('YaCy status request failed:', response.status)
            return null
        }

        const data = await response.json()

        return {
            peerCount: parseInt(data.peerCount || data.activePeerCount || '0'),
            documentsIndexed: parseInt(data.indexedPages || data['index-size'] || '0'),
            queriesPerMinute: parseFloat(data.qpm || data.localQPM || '0'),
            uptime: parseInt(data.uptime || '0'),
            memory: {
                used: parseInt(data.usedMemory || data['memory-used'] || '0'),
                max: parseInt(data.maxMemory || data['memory-max'] || '0')
            },
            version: data.version || data.svnRevision || 'unknown',
            networkName: data.networkName || 'freeworld',
            peerType: data.peerType || data.yourtype || 'unknown'
        }
    } catch (error) {
        console.error('YaCy API error (status):', error)
        return null
    }
}

// Fetch list of known YaCy peers
export async function fetchYaCyPeers(type?: 'senior' | 'principal' | 'junior'): Promise<YaCyPeer[]> {
    try {
        let url = `${config.baseUrl}/api/peers.json`
        if (type) {
            url += `?type=${type}`
        }

        const response = await fetchWithTimeout(url)

        if (!response.ok) {
            console.error('YaCy peers request failed:', response.status)
            return []
        }

        const data = await response.json()
        const peers = data.peers || data.seedlist || []

        return peers.map((peer: any) => ({
            hash: peer.hash || peer.Hash,
            name: peer.name || peer.Name || 'Unknown',
            type: (peer.type || peer.PeerType || 'junior').toLowerCase(),
            lastSeen: parseInt(peer.lastSeen || peer.LastSeen || Date.now().toString()),
            speed: parseFloat(peer.speed || peer.Speed || '0'),
            links: parseInt(peer.links || peer.LCount || '0'),
            words: parseInt(peer.words || peer.ICount || '0'),
            ppm: parseFloat(peer.ppm || peer.PPM || '0'),
            qph: parseFloat(peer.qph || peer.QPH || '0'),
            version: peer.version || peer.Version || 'unknown',
            location: peer.location ? {
                country: peer.location.country || peer.Country,
                city: peer.location.city || peer.City,
                lat: parseFloat(peer.location.lat || peer.Latitude || '0'),
                lon: parseFloat(peer.location.lon || peer.Longitude || '0')
            } : undefined
        }))
    } catch (error) {
        console.error('YaCy Peers error:', error)
        return []
    }
}

// Execute a search query on YaCy
export async function searchYaCy(
    query: string,
    options: {
        count?: number
        offset?: number
        resource?: 'local' | 'global' | 'freeworld'
        contentdom?: 'text' | 'image' | 'video' | 'audio' | 'app'
        urlmaskfilter?: string
        prefermaskfilter?: string
    } = {}
): Promise<YaCySearchResponse | null> {
    try {
        const params = new URLSearchParams({
            query: query,
            count: (options.count || config.defaultResultCount).toString(),
            offset: (options.offset || 0).toString(),
            resource: options.resource || 'global',
            contentdom: options.contentdom || 'text',
            nav: 'all',
            verify: 'ifexist',
            searchsec: '0'
        })

        if (options.urlmaskfilter) {
            params.set('urlmaskfilter', options.urlmaskfilter)
        }

        if (options.prefermaskfilter) {
            params.set('prefermaskfilter', options.prefermaskfilter)
        }

        const startTime = Date.now()
        const response = await fetchWithTimeout(
            `${config.baseUrl}/yacysearch.json?${params.toString()}`,
            {},
            30000 // Longer timeout for searches
        )

        if (!response.ok) {
            console.error('YaCy search request failed:', response.status)
            return null
        }

        const data = await response.json()
        const searchTime = Date.now() - startTime

        // Parse the YaCy response format
        const channel = data.channels?.[0] || {}
        const items = channel.items || data.items || []

        return {
            channels: [{
                title: channel.title || 'YaCy Search',
                description: channel.description || `Search results for: ${query}`,
                totalResults: parseInt(channel.totalResults || data.totalResults || items.length.toString()),
                startIndex: parseInt(channel.startIndex || '0'),
                itemsPerPage: parseInt(channel.itemsPerPage || items.length.toString()),
                searchTerms: query,
                items: items.map((item: any) => ({
                    title: item.title || 'Untitled',
                    link: item.link || item.url,
                    description: item.description || item.snippet || '',
                    pubDate: item.pubDate || item.date,
                    size: parseInt(item.size || '0'),
                    mimetype: item.mimetype || item.type || 'text/html',
                    host: item.host || new URL(item.link || item.url || 'http://unknown').hostname,
                    path: item.path || new URL(item.link || item.url || 'http://unknown').pathname,
                    ranking: parseFloat(item.ranking || item.score || '0')
                }))
            }],
            totalResults: parseInt(channel.totalResults || data.totalResults || items.length.toString()),
            searchTime
        }
    } catch (error) {
        console.error('YaCy search error:', error)
        return null
    }
}

// Get crawl status
export async function fetchCrawlStatus(): Promise<YaCyCrawlStatus | null> {
    try {
        const response = await fetchWithTimeout(
            `${config.baseUrl}/api/crawls_p.json`
        )

        if (!response.ok) return null

        const data = await response.json()

        return {
            urlsActive: parseInt(data.activeCount || '0'),
            urlsPending: parseInt(data.queueSize || '0'),
            urlsProcessed: parseInt(data.processedCount || '0'),
            ppm: parseFloat(data.ppm || '0'),
            isRunning: data.isActive === 'true' || data.isActive === true
        }
    } catch (error) {
        console.error('YaCy crawl status error:', error)
        return null
    }
}

// Start a new crawl
export async function startCrawl(
    startUrl: string,
    options: {
        crawlingDepth?: number
        crawlingPages?: number
        indexText?: boolean
        indexMedia?: boolean
    } = {}
): Promise<boolean> {
    try {
        const params = new URLSearchParams({
            crawlingURL: startUrl,
            crawlingDepth: (options.crawlingDepth || 3).toString(),
            range: (options.crawlingPages || 1000).toString(),
            indexText: (options.indexText !== false).toString(),
            indexMedia: (options.indexMedia !== false).toString(),
            crawlingMode: 'url'
        })

        const response = await fetchWithTimeout(
            `${config.baseUrl}/Crawler_p.json?${params.toString()}`,
            { method: 'POST' }
        )

        return response.ok
    } catch (error) {
        console.error('YaCy start crawl error:', error)
        return false
    }
}

// Get network statistics
export async function fetchNetworkStats(): Promise<{
    activeCount: number
    juniorCount: number
    seniorCount: number
    principalCount: number
    potentialCount: number
} | null> {
    try {
        const response = await fetchWithTimeout(
            `${config.baseUrl}/api/network_p.json`
        )

        if (!response.ok) return null

        const data = await response.json()

        return {
            activeCount: parseInt(data.activeCount || '0'),
            juniorCount: parseInt(data.juniorCount || '0'),
            seniorCount: parseInt(data.seniorCount || '0'),
            principalCount: parseInt(data.principalCount || '0'),
            potentialCount: parseInt(data.potentialCount || '0')
        }
    } catch (error) {
        console.error('YaCy network stats error:', error)
        return null
    }
}

// Utility: Build a visualization-friendly peer list
export async function fetchPeersForVisualization(): Promise<Array<{
    id: string
    name: string
    type: string
    metrics: {
        documents: number
        speed: number
        uptime: number
    }
    location?: {
        region: string
        coordinates?: [number, number]
    }
}>> {
    const peers = await fetchYaCyPeers()

    return peers.map(peer => ({
        id: peer.hash,
        name: peer.name,
        type: peer.type,
        metrics: {
            documents: peer.links + peer.words,
            speed: peer.speed,
            uptime: peer.lastSeen
        },
        location: peer.location ? {
            region: peer.location.country,
            coordinates: peer.location.lat && peer.location.lon
                ? [peer.location.lat, peer.location.lon]
                : undefined
        } : undefined
    }))
}

// Export configuration for external access
export const yacyConfig = {
    getBaseUrl: () => config.baseUrl,
    setBaseUrl: (url: string) => { config.baseUrl = url },
    setTimeout: (ms: number) => { config.timeout = ms }
}
