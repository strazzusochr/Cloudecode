// Network Search Visualization - Main Entry Point
import React, { Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei'
import { NetworkVisualization } from '../components/network/NetworkVisualization'
import { useNetworkStore, NetworkType } from '../src/stores/networkStore'
import { isYaCyOnline, fetchYaCyStatus, searchYaCy } from '../src/services/yacyApi'

// Loading component
function LoadingScreen() {
    return (
        <div className="loading">
            <div className="spinner"></div>
            <h1>Network Visualization</h1>
            <p>Initialisiere 3D-Netzwerk...</p>
        </div>
    )
}

// Search bar component
function SearchBar() {
    const [query, setQuery] = useState('')
    const startQuery = useNetworkStore((state) => state.startQuery)
    const nodes = useNetworkStore((state) => state.nodes)
    const completeQuery = useNetworkStore((state) => state.completeQuery)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        // Create a random path through the network
        const pathLength = Math.min(Math.floor(Math.random() * 5) + 3, nodes.length)
        const shuffled = [...nodes].sort(() => Math.random() - 0.5)
        const path = shuffled.slice(0, pathLength).map(n => n.id)

        startQuery(query, path)

        // Try to search YaCy
        try {
            const results = await searchYaCy(query, 100)
            if (results) {
                completeQuery(results.totalResults)
            }
        } catch (error) {
            console.log('YaCy search failed, using mock results')
            completeQuery(Math.floor(Math.random() * 10000))
        }
    }

    return (
        <div className="search-bar">
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Suche im dezentralen Netzwerk..."
                />
                <button type="submit">Suchen</button>
            </form>
        </div>
    )
}

// Network type selector
function NetworkSelector() {
    const networkType = useNetworkStore((state) => state.networkType)
    const initializeNetwork = useNetworkStore((state) => state.initializeNetwork)

    const networks: { type: NetworkType; label: string; icon: string }[] = [
        { type: 'yacy', label: 'YaCy P2P', icon: '🟢' },
        { type: 'presearch', label: 'Presearch', icon: '🔷' },
        { type: 'hybrid', label: 'Hybrid', icon: '🔗' },
        { type: 'privacy', label: 'Privacy (Tor/I2P)', icon: '🧅' },
        { type: 'local', label: 'Local Search', icon: '⚡' }
    ]

    return (
        <div className="network-selector">
            {networks.map(({ type, label, icon }) => (
                <button
                    key={type}
                    className={networkType === type ? 'active' : ''}
                    onClick={() => initializeNetwork(type)}
                >
                    {icon} {label}
                </button>
            ))}
        </div>
    )
}

// Controls panel
function Controls() {
    const toggleDataFlow = useNetworkStore((state) => state.toggleDataFlow)
    const toggleTokenRewards = useNetworkStore((state) => state.toggleTokenRewards)
    const toggleRainbowMode = useNetworkStore((state) => state.toggleRainbowMode)
    const showDataFlow = useNetworkStore((state) => state.showDataFlow)
    const showTokenRewards = useNetworkStore((state) => state.showTokenRewards)
    const isRainbowMode = useNetworkStore((state) => state.isRainbowMode)

    return (
        <div className="controls">
            <button
                className={showDataFlow ? 'active' : ''}
                onClick={toggleDataFlow}
            >
                Datenfluss
            </button>
            <button
                className={showTokenRewards ? 'active' : ''}
                onClick={toggleTokenRewards}
            >
                Token Rewards
            </button>
            <button
                className={isRainbowMode ? 'active' : ''}
                onClick={toggleRainbowMode}
            >
                Rainbow Mode
            </button>
        </div>
    )
}

// Connection status
function ConnectionStatus() {
    const [status, setStatus] = useState<'connecting' | 'online' | 'offline'>('connecting')

    useEffect(() => {
        const checkConnection = async () => {
            setStatus('connecting')
            const online = await isYaCyOnline()
            setStatus(online ? 'online' : 'offline')
        }

        checkConnection()
        const interval = setInterval(checkConnection, 30000)
        return () => clearInterval(interval)
    }, [])

    const labels = {
        connecting: 'Verbinde...',
        online: 'YaCy Online',
        offline: 'YaCy Offline (Mock-Modus)'
    }

    return (
        <div className="status">
            <span className={`indicator ${status}`}></span>
            {labels[status]}
        </div>
    )
}

// Main 3D Scene
function Scene() {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 5, 25]} fov={60} />
            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={5}
                maxDistance={100}
                autoRotate
                autoRotateSpeed={0.2}
            />

            {/* Background stars */}
            <Stars
                radius={100}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={0.5}
            />

            {/* Ambient lighting */}
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 10, 5]} intensity={0.5} />

            {/* Network visualization */}
            <NetworkVisualization />
        </>
    )
}

// Main App
function App() {
    const initializeNetwork = useNetworkStore((state) => state.initializeNetwork)
    const isInitialized = useNetworkStore((state) => state.isInitialized)

    useEffect(() => {
        if (!isInitialized) {
            initializeNetwork('yacy')
        }
    }, [isInitialized, initializeNetwork])

    return (
        <>
            <SearchBar />
            <NetworkSelector />
            <Controls />
            <ConnectionStatus />

            <Canvas
                style={{ width: '100%', height: '100%' }}
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance'
                }}
            >
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </Canvas>
        </>
    )
}

// Mount the app
const container = document.getElementById('root')
if (container) {
    const root = createRoot(container)
    root.render(<App />)
}
