// Network Store - Zustand State Management for Search Network Visualization
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

// Node Types for different search network components
export type NodeType =
    | 'yacy'        // YaCy P2P search peer
    | 'presearch'   // Presearch decentralized node
    | 'gateway'     // Gateway/Entry node
    | 'storage'     // IPFS/Storage node
    | 'tor'         // Tor relay node
    | 'i2p'         // I2P router node
    | 'searxng'     // SearXNG meta-search instance
    | 'meilisearch' // Meilisearch local instance

export type NetworkType = 'yacy' | 'presearch' | 'hybrid' | 'privacy' | 'local'

export interface NodeData {
    id: string
    type: NodeType
    position: [number, number, number]
    // YaCy specific
    documentsIndexed?: number
    peerCount?: number
    // Presearch specific
    stake?: number
    rewardsPending?: number
    // Common metrics
    latency?: number
    uptime?: number
    connections?: number
    region?: string
    isOnline?: boolean
    lastSeen?: number
}

export interface ConnectionData {
    id: string
    from: string
    to: string
    type: 'p2p' | 'query' | 'blockchain' | 'reward' | 'dht'
    strength: number
    isActive: boolean
    bandwidth?: number
}

export interface QueryState {
    isActive: boolean
    query: string
    path: string[]
    currentStep: number
    latency: number
    resultsFound: number
    startTime: number
}

export interface NetworkStats {
    totalNodes: number
    activeNodes: number
    totalConnections: number
    averageLatency: number
    documentsIndexed: number
    queriesPerMinute: number
    networkHealth: number
}

interface NetworkState {
    // Network configuration
    networkType: NetworkType
    isInitialized: boolean
    isLoading: boolean
    error: string | null

    // Node data
    nodes: NodeData[]
    connections: ConnectionData[]

    // Interaction state
    hoveredNode: string | null
    selectedNode: string | null
    mousePosition: [number, number, number]

    // Query visualization
    query: QueryState

    // Network statistics
    stats: NetworkStats

    // Display options
    showDataFlow: boolean
    showTokenRewards: boolean
    isRainbowMode: boolean
    showRegions: boolean

    // Actions
    setNetworkType: (type: NetworkType) => void
    setNodes: (nodes: NodeData[]) => void
    addNode: (node: NodeData) => void
    removeNode: (id: string) => void
    updateNode: (id: string, updates: Partial<NodeData>) => void

    setConnections: (connections: ConnectionData[]) => void
    addConnection: (connection: ConnectionData) => void
    removeConnection: (id: string) => void

    setHoveredNode: (id: string | null) => void
    setSelectedNode: (id: string | null) => void
    setMousePosition: (pos: [number, number, number]) => void

    startQuery: (query: string, path: string[]) => void
    advanceQuery: () => void
    completeQuery: (resultsFound: number) => void
    resetQuery: () => void

    updateStats: (stats: Partial<NetworkStats>) => void

    toggleDataFlow: () => void
    toggleTokenRewards: () => void
    toggleRainbowMode: () => void
    toggleRegions: () => void

    initializeNetwork: (type: NetworkType) => void
    reset: () => void
}

// Generate mock nodes for visualization
function generateMockNodes(type: NetworkType, count: number): NodeData[] {
    const nodes: NodeData[] = []
    const regions = ['NA', 'EU', 'AS', 'SA', 'AF', 'OC']

    // Add gateway nodes
    const gatewayCount = Math.ceil(count * 0.05)
    for (let i = 0; i < gatewayCount; i++) {
        const angle = (i / gatewayCount) * Math.PI * 2
        nodes.push({
            id: `gateway-${i}`,
            type: 'gateway',
            position: [
                Math.cos(angle) * 3,
                (Math.random() - 0.5) * 2,
                Math.sin(angle) * 3
            ],
            latency: 10 + Math.random() * 30,
            uptime: 0.99 + Math.random() * 0.01,
            connections: Math.floor(50 + Math.random() * 100),
            region: regions[i % regions.length],
            isOnline: true
        })
    }

    // Add main nodes based on network type
    const mainCount = count - gatewayCount
    for (let i = 0; i < mainCount; i++) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const radius = 5 + Math.random() * 15

        const position: [number, number, number] = [
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta) * 0.5,
            radius * Math.cos(phi)
        ]

        let nodeType: NodeType
        let nodeData: Partial<NodeData> = {}

        if (type === 'yacy' || (type === 'hybrid' && Math.random() > 0.5)) {
            nodeType = 'yacy'
            nodeData = {
                documentsIndexed: Math.floor(10000 + Math.random() * 500000),
                peerCount: Math.floor(5 + Math.random() * 50),
                latency: 50 + Math.random() * 500
            }
        } else if (type === 'presearch' || type === 'hybrid') {
            nodeType = 'presearch'
            nodeData = {
                stake: Math.floor(4000 + Math.random() * 100000),
                rewardsPending: Math.random() * 10,
                latency: 20 + Math.random() * 200
            }
        } else if (type === 'privacy') {
            nodeType = Math.random() > 0.5 ? 'tor' : 'i2p'
            nodeData = {
                latency: 100 + Math.random() * 1000,
                connections: Math.floor(3 + Math.random() * 20)
            }
        } else {
            nodeType = Math.random() > 0.5 ? 'searxng' : 'meilisearch'
            nodeData = {
                documentsIndexed: Math.floor(1000 + Math.random() * 100000),
                latency: 5 + Math.random() * 50
            }
        }

        nodes.push({
            id: `${nodeType}-${i}`,
            type: nodeType,
            position,
            uptime: 0.8 + Math.random() * 0.2,
            region: regions[Math.floor(Math.random() * regions.length)],
            isOnline: Math.random() > 0.1,
            lastSeen: Date.now() - Math.floor(Math.random() * 3600000),
            ...nodeData
        })
    }

    // Add storage nodes
    const storageCount = Math.ceil(count * 0.1)
    for (let i = 0; i < storageCount; i++) {
        const angle = (i / storageCount) * Math.PI * 2
        const radius = 8 + Math.random() * 4
        nodes.push({
            id: `storage-${i}`,
            type: 'storage',
            position: [
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 4,
                Math.sin(angle) * radius
            ],
            latency: 30 + Math.random() * 100,
            uptime: 0.95 + Math.random() * 0.05,
            connections: Math.floor(10 + Math.random() * 50),
            region: regions[i % regions.length],
            isOnline: true
        })
    }

    return nodes
}

// Generate connections between nodes
function generateConnections(nodes: NodeData[], density: number = 0.02): ConnectionData[] {
    const connections: ConnectionData[] = []
    const connectionTypes: ConnectionData['type'][] = ['p2p', 'query', 'dht']

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (Math.random() < density) {
                // Calculate distance
                const dx = nodes[i].position[0] - nodes[j].position[0]
                const dy = nodes[i].position[1] - nodes[j].position[1]
                const dz = nodes[i].position[2] - nodes[j].position[2]
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

                // Closer nodes more likely to connect
                if (distance < 10 || Math.random() < 0.3) {
                    let connType: ConnectionData['type'] = 'p2p'

                    if (nodes[i].type === 'gateway' || nodes[j].type === 'gateway') {
                        connType = 'query'
                    } else if (nodes[i].type === 'presearch' || nodes[j].type === 'presearch') {
                        connType = Math.random() > 0.7 ? 'blockchain' : 'p2p'
                    } else if (nodes[i].type === 'yacy' || nodes[j].type === 'yacy') {
                        connType = 'dht'
                    }

                    connections.push({
                        id: `conn-${i}-${j}`,
                        from: nodes[i].id,
                        to: nodes[j].id,
                        type: connType,
                        strength: 1 - (distance / 20),
                        isActive: Math.random() > 0.3,
                        bandwidth: Math.floor(Math.random() * 1000)
                    })
                }
            }
        }
    }

    return connections
}

// Initial state
const initialState = {
    networkType: 'yacy' as NetworkType,
    isInitialized: false,
    isLoading: false,
    error: null,
    nodes: [],
    connections: [],
    hoveredNode: null,
    selectedNode: null,
    mousePosition: [0, 0, 0] as [number, number, number],
    query: {
        isActive: false,
        query: '',
        path: [],
        currentStep: 0,
        latency: 0,
        resultsFound: 0,
        startTime: 0
    },
    stats: {
        totalNodes: 0,
        activeNodes: 0,
        totalConnections: 0,
        averageLatency: 0,
        documentsIndexed: 0,
        queriesPerMinute: 0,
        networkHealth: 100
    },
    showDataFlow: true,
    showTokenRewards: true,
    isRainbowMode: false,
    showRegions: true
}

export const useNetworkStore = create<NetworkState>()(
    immer((set, get) => ({
        ...initialState,

        setNetworkType: (type) => set((state) => {
            state.networkType = type
        }),

        setNodes: (nodes) => set((state) => {
            state.nodes = nodes
            state.stats.totalNodes = nodes.length
            state.stats.activeNodes = nodes.filter(n => n.isOnline).length
        }),

        addNode: (node) => set((state) => {
            state.nodes.push(node)
            state.stats.totalNodes = state.nodes.length
        }),

        removeNode: (id) => set((state) => {
            state.nodes = state.nodes.filter(n => n.id !== id)
            state.connections = state.connections.filter(
                c => c.from !== id && c.to !== id
            )
            state.stats.totalNodes = state.nodes.length
        }),

        updateNode: (id, updates) => set((state) => {
            const index = state.nodes.findIndex(n => n.id === id)
            if (index !== -1) {
                Object.assign(state.nodes[index], updates)
            }
        }),

        setConnections: (connections) => set((state) => {
            state.connections = connections
            state.stats.totalConnections = connections.length
        }),

        addConnection: (connection) => set((state) => {
            state.connections.push(connection)
            state.stats.totalConnections = state.connections.length
        }),

        removeConnection: (id) => set((state) => {
            state.connections = state.connections.filter(c => c.id !== id)
            state.stats.totalConnections = state.connections.length
        }),

        setHoveredNode: (id) => set((state) => {
            state.hoveredNode = id
        }),

        setSelectedNode: (id) => set((state) => {
            state.selectedNode = id
        }),

        setMousePosition: (pos) => set((state) => {
            state.mousePosition = pos
        }),

        startQuery: (query, path) => set((state) => {
            state.query = {
                isActive: true,
                query,
                path,
                currentStep: 0,
                latency: 0,
                resultsFound: 0,
                startTime: Date.now()
            }
        }),

        advanceQuery: () => set((state) => {
            if (state.query.currentStep < state.query.path.length - 1) {
                state.query.currentStep++
                state.query.latency = Date.now() - state.query.startTime
            } else {
                // Query complete
                state.query.isActive = false
            }
        }),

        completeQuery: (resultsFound) => set((state) => {
            state.query.resultsFound = resultsFound
            state.query.latency = Date.now() - state.query.startTime
            state.query.isActive = false
        }),

        resetQuery: () => set((state) => {
            state.query = {
                isActive: false,
                query: '',
                path: [],
                currentStep: 0,
                latency: 0,
                resultsFound: 0,
                startTime: 0
            }
        }),

        updateStats: (stats) => set((state) => {
            Object.assign(state.stats, stats)
        }),

        toggleDataFlow: () => set((state) => {
            state.showDataFlow = !state.showDataFlow
        }),

        toggleTokenRewards: () => set((state) => {
            state.showTokenRewards = !state.showTokenRewards
        }),

        toggleRainbowMode: () => set((state) => {
            state.isRainbowMode = !state.isRainbowMode
        }),

        toggleRegions: () => set((state) => {
            state.showRegions = !state.showRegions
        }),

        initializeNetwork: (type) => {
            set((state) => {
                state.isLoading = true
                state.error = null
            })

            try {
                const nodeCount = type === 'local' ? 50 : 200
                const nodes = generateMockNodes(type, nodeCount)
                const connections = generateConnections(nodes)

                // Calculate stats
                const totalDocs = nodes.reduce((sum, n) => sum + (n.documentsIndexed || 0), 0)
                const latencies = nodes.filter(n => n.latency).map(n => n.latency!)
                const avgLatency = latencies.length > 0
                    ? latencies.reduce((a, b) => a + b, 0) / latencies.length
                    : 0

                set((state) => {
                    state.networkType = type
                    state.nodes = nodes
                    state.connections = connections
                    state.isInitialized = true
                    state.isLoading = false
                    state.stats = {
                        totalNodes: nodes.length,
                        activeNodes: nodes.filter(n => n.isOnline).length,
                        totalConnections: connections.length,
                        averageLatency: Math.round(avgLatency),
                        documentsIndexed: totalDocs,
                        queriesPerMinute: Math.floor(10 + Math.random() * 100),
                        networkHealth: 85 + Math.floor(Math.random() * 15)
                    }
                })
            } catch (error) {
                set((state) => {
                    state.isLoading = false
                    state.error = error instanceof Error ? error.message : 'Failed to initialize network'
                })
            }
        },

        reset: () => set(() => initialState)
    }))
)

// Selector hooks for performance optimization
export const useNodes = () => useNetworkStore((state) => state.nodes)
export const useConnections = () => useNetworkStore((state) => state.connections)
export const useNetworkStats = () => useNetworkStore((state) => state.stats)
export const useQueryState = () => useNetworkStore((state) => state.query)
