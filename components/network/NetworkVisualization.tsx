// NetworkVisualization.tsx - 3D Search Network Visualization
// Uses React Three Fiber with GPU-instanced rendering for performance

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Line, Trail, Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { useNetworkStore, NodeData } from '../../src/stores/networkStore'

// GPU Instanced Nodes for massive performance
function InstancedNodes() {
    const nodes = useNetworkStore((state) => state.nodes)
    const hoveredNode = useNetworkStore((state) => state.hoveredNode)
    const setHoveredNode = useNetworkStore((state) => state.setHoveredNode)
    const query = useNetworkStore((state) => state.query)
    const isRainbowMode = useNetworkStore((state) => state.isRainbowMode)

    const meshRef = useRef<THREE.InstancedMesh>(null)
    const glowMeshRef = useRef<THREE.InstancedMesh>(null)
    const dummy = useMemo(() => new THREE.Object3D(), [])
    const color = useMemo(() => new THREE.Color(), [])

    // Colors array for instancing
    const colors = useMemo(() => new Float32Array(Math.max(nodes.length, 1) * 3), [nodes.length])
    const scales = useMemo(() => new Float32Array(Math.max(nodes.length, 1)), [nodes.length])

    const queryPathSet = useMemo(() => {
        return new Set(query.path.slice(0, query.currentStep + 1))
    }, [query.path, query.currentStep])

    useFrame((state) => {
        if (!meshRef.current || !glowMeshRef.current || nodes.length === 0) return

        const time = state.clock.elapsedTime

        nodes.forEach((node, i) => {
            // Position with subtle floating animation
            dummy.position.set(
                node.position[0],
                node.position[1] + Math.sin(time * 0.5 + i * 0.1) * 0.05,
                node.position[2]
            )

            // Scale based on node type and state
            let scale = 0.1
            const isInPath = queryPathSet.has(node.id)
            const isHovered = hoveredNode === node.id

            if (node.type === 'gateway') {
                scale = 0.35
            } else if (node.type === 'storage') {
                scale = 0.2
            } else if (node.type === 'presearch') {
                scale = 0.08 + Math.min((node.stake || 4000) / 200000, 0.15)
            } else {
                scale = 0.1 + Math.min((node.documentsIndexed || 0) / 1000000, 0.1)
            }

            if (isInPath) scale *= 2.5
            if (isHovered) scale *= 1.5

            scales[i] = scale
            dummy.scale.setScalar(scale)

            // Rotation for active nodes
            if (isInPath) {
                dummy.rotation.y = time * 3
                dummy.rotation.x = time * 2
            } else {
                dummy.rotation.y = time * 0.1 + i * 0.01
            }

            dummy.updateMatrix()
            meshRef.current!.setMatrixAt(i, dummy.matrix)

            // Glow mesh (slightly larger)
            dummy.scale.setScalar(scale * 1.5)
            dummy.updateMatrix()
            glowMeshRef.current!.setMatrixAt(i, dummy.matrix)

            // Color based on node type and state
            if (isRainbowMode) {
                const hue = ((i / nodes.length) + time * 0.1) % 1
                color.setHSL(hue, 0.9, 0.55)
            } else if (isInPath) {
                color.setHex(0xffff00)
            } else if (isHovered) {
                color.setHex(0xffffff)
            } else if (node.type === 'gateway') {
                color.setHSL(0.6, 1, 0.7)
            } else if (node.type === 'storage') {
                color.setHSL(0.8, 0.8, 0.6)
            } else if (node.type === 'presearch') {
                const stakeRatio = Math.min((node.stake || 4000) / 100000, 1)
                color.setHSL(0.55 + stakeRatio * 0.1, 0.9, 0.4 + stakeRatio * 0.3)
            } else if (node.type === 'tor') {
                color.setHSL(0.75, 0.8, 0.5)
            } else if (node.type === 'i2p') {
                color.setHSL(0.52, 0.9, 0.55)
            } else if (node.type === 'searxng') {
                color.setHSL(0.02, 0.85, 0.55)
            } else if (node.type === 'meilisearch') {
                color.setHSL(0.08, 1, 0.6)
            } else {
                // YaCy and others: Green based on latency
                const latencyRatio = 1 - Math.min((node.latency || 1000) / 5000, 1)
                color.setHSL(0.35, 0.85, 0.35 + latencyRatio * 0.35)
            }

            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b
        })

        meshRef.current.instanceMatrix.needsUpdate = true
        glowMeshRef.current.instanceMatrix.needsUpdate = true

        // Update color attribute if it exists
        const colorAttr = meshRef.current.geometry.attributes.color
        if (colorAttr) {
            colorAttr.needsUpdate = true
        }
    })

    // Raycasting for hover detection
    const { raycaster, camera, pointer } = useThree()

    useFrame(() => {
        if (!meshRef.current || nodes.length === 0) return

        raycaster.setFromCamera(pointer, camera)
        const intersects = raycaster.intersectObject(meshRef.current)

        if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
            const nodeId = nodes[intersects[0].instanceId]?.id
            if (nodeId !== hoveredNode) {
                setHoveredNode(nodeId)
            }
        } else if (hoveredNode) {
            setHoveredNode(null)
        }
    })

    if (nodes.length === 0) return null

    return (
        <group>
            {/* Main nodes */}
            <instancedMesh ref={meshRef} args={[undefined, undefined, nodes.length]} frustumCulled={false}>
                <icosahedronGeometry args={[1, 2]}>
                    <instancedBufferAttribute
                        attach="attributes-color"
                        args={[colors, 3]}
                    />
                </icosahedronGeometry>
                <meshStandardMaterial
                    vertexColors
                    metalness={0.8}
                    roughness={0.2}
                    emissive="#ffffff"
                    emissiveIntensity={0.3}
                />
            </instancedMesh>

            {/* Glow layer */}
            <instancedMesh ref={glowMeshRef} args={[undefined, undefined, nodes.length]} frustumCulled={false}>
                <icosahedronGeometry args={[1, 1]} />
                <meshBasicMaterial
                    color="#4488ff"
                    transparent
                    opacity={0.1}
                    side={THREE.BackSide}
                />
            </instancedMesh>
        </group>
    )
}

// Hover tooltip component
function NodeTooltip() {
    const hoveredNode = useNetworkStore((state) => state.hoveredNode)
    const nodes = useNetworkStore((state) => state.nodes)

    const node = useMemo(() => {
        return nodes.find(n => n.id === hoveredNode)
    }, [nodes, hoveredNode])

    if (!node) return null

    const typeLabels: Record<string, string> = {
        presearch: 'Presearch Node',
        yacy: 'YaCy Peer',
        gateway: 'Gateway Node',
        storage: 'IPFS Storage',
        tor: 'Tor Relay',
        i2p: 'I2P Router',
        searxng: 'SearXNG Engine',
        meilisearch: 'Meilisearch Core'
    }

    return (
        <Html position={node.position} center style={{ pointerEvents: 'none', zIndex: 1000 }}>
            <div style={{
                background: 'rgba(0, 10, 30, 0.95)',
                border: '1px solid rgba(68, 136, 255, 0.5)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: 'white',
                fontSize: '12px',
                fontFamily: 'monospace',
                minWidth: '200px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: '#4488ff',
                    fontSize: '14px'
                }}>
                    {typeLabels[node.type] || node.type}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><strong>ID:</strong> {node.id.substring(0, 20)}...</div>
                    {node.stake !== undefined && (
                        <div><strong>Stake:</strong> {node.stake.toLocaleString()} PRE</div>
                    )}
                    {node.uptime !== undefined && (
                        <div><strong>Uptime:</strong> {(node.uptime * 100).toFixed(1)}%</div>
                    )}
                    {node.latency !== undefined && (
                        <div><strong>Latenz:</strong> {node.latency}ms</div>
                    )}
                    {node.region && (
                        <div><strong>Region:</strong> {node.region}</div>
                    )}
                    {node.documentsIndexed !== undefined && (
                        <div><strong>Dokumente:</strong> {node.documentsIndexed.toLocaleString()}</div>
                    )}
                    {node.connections !== undefined && (
                        <div><strong>Verbindungen:</strong> {node.connections}</div>
                    )}
                    {node.peerCount !== undefined && (
                        <div><strong>Peers:</strong> {node.peerCount}</div>
                    )}
                    {node.rewardsPending !== undefined && node.rewardsPending > 0 && (
                        <div><strong>Pending:</strong> {node.rewardsPending.toFixed(2)} PRE</div>
                    )}
                </div>
            </div>
        </Html>
    )
}

// Optimized connections with GPU line rendering
function Connections() {
    const nodes = useNetworkStore((state) => state.nodes)
    const connections = useNetworkStore((state) => state.connections)
    const networkType = useNetworkStore((state) => state.networkType)
    const showDataFlow = useNetworkStore((state) => state.showDataFlow)

    const nodeMap = useMemo(() => {
        const map = new Map<string, NodeData>()
        nodes.forEach(node => map.set(node.id, node))
        return map
    }, [nodes])

    // Use geometry for all connections at once (massive performance boost)
    const lineGeometry = useMemo(() => {
        const positions: number[] = []
        const colors: number[] = []

        const activeConnections = connections.filter(c => c.isActive).slice(0, 300)

        activeConnections.forEach((conn) => {
            const fromNode = nodeMap.get(conn.from)
            const toNode = nodeMap.get(conn.to)
            if (!fromNode || !toNode) return

            positions.push(
                fromNode.position[0], fromNode.position[1], fromNode.position[2],
                toNode.position[0], toNode.position[1], toNode.position[2]
            )

            // Color based on connection type
            let r = 0.2, g = 0.5, b = 1.0
            if (conn.type === 'blockchain') {
                r = 1.0; g = 0.8; b = 0.2
            } else if (conn.type === 'query') {
                r = 1.0; g = 1.0; b = 0.0
            } else if (conn.type === 'reward') {
                r = 1.0; g = 0.85; b = 0.0
            } else if (networkType === 'yacy') {
                r = 0.3; g = 1.0; b = 0.5
            }

            colors.push(r, g, b, r, g, b)
        })

        const geometry = new THREE.BufferGeometry()
        if (positions.length > 0) {
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        }

        return geometry
    }, [connections, nodeMap, networkType])

    if (!showDataFlow || connections.length === 0) return null

    return (
        <lineSegments geometry={lineGeometry} frustumCulled={false}>
            <lineBasicMaterial vertexColors transparent opacity={0.15} />
        </lineSegments>
    )
}

// Query visualization with trail effect
function QueryVisualization() {
    const query = useNetworkStore((state) => state.query)
    const nodes = useNetworkStore((state) => state.nodes)
    const advanceQuery = useNetworkStore((state) => state.advanceQuery)
    const networkType = useNetworkStore((state) => state.networkType)

    const timeRef = useRef(0)
    const particleRef = useRef<THREE.Mesh>(null)

    const nodeMap = useMemo(() => {
        const map = new Map<string, NodeData>()
        nodes.forEach(node => map.set(node.id, node))
        return map
    }, [nodes])

    const currentNode = useMemo(() => {
        if (!query.isActive || query.path.length === 0) return null
        return nodeMap.get(query.path[query.currentStep])
    }, [query, nodeMap])

    useFrame((_, delta) => {
        if (!query.isActive) return

        const speed = networkType === 'presearch' ? 0.3 : 0.8
        timeRef.current += delta

        if (timeRef.current > speed) {
            timeRef.current = 0
            advanceQuery()
        }

        // Animate query particle
        if (particleRef.current && currentNode) {
            particleRef.current.position.set(...currentNode.position)
            particleRef.current.rotation.y += delta * 5
        }
    })

    if (!query.isActive || query.path.length < 2) return null

    // Build path points
    const pathPoints: THREE.Vector3[] = []
    for (let i = 0; i <= query.currentStep && i < query.path.length; i++) {
        const node = nodeMap.get(query.path[i])
        if (node) {
            pathPoints.push(new THREE.Vector3(...node.position))
        }
    }

    return (
        <group>
            {/* Query path line */}
            {pathPoints.length >= 2 && (
                <Line
                    points={pathPoints}
                    color="#ffff00"
                    lineWidth={3}
                    transparent
                    opacity={0.9}
                    dashed
                    dashSize={0.3}
                    gapSize={0.1}
                />
            )}

            {/* Active query particle */}
            {currentNode && (
                <Trail
                    width={1}
                    length={8}
                    color="#ffff00"
                    attenuation={(t) => t * t}
                >
                    <mesh ref={particleRef} position={currentNode.position}>
                        <dodecahedronGeometry args={[0.3, 0]} />
                        <meshStandardMaterial
                            color="#ffff00"
                            emissive="#ffff00"
                            emissiveIntensity={2}
                        />
                    </mesh>
                </Trail>
            )}

            {/* Query info display */}
            <Html position={[0, 12, 0]} center>
                <div style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    color: '#ffff00',
                    fontFamily: 'monospace',
                    textAlign: 'center',
                    border: '1px solid #ffff00'
                }}>
                    <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                        "{query.query}"
                    </div>
                    <div style={{ fontSize: '12px', color: '#aaa' }}>
                        Schritt {query.currentStep + 1}/{query.path.length} |
                        ~{Math.round(query.latency)}ms |
                        {query.resultsFound.toLocaleString()} Ergebnisse
                    </div>
                </div>
            </Html>
        </group>
    )
}

// Token flow particle system
function TokenFlowParticles() {
    const networkType = useNetworkStore((state) => state.networkType)
    const showTokenRewards = useNetworkStore((state) => state.showTokenRewards)

    const particleCount = 1000
    const particlesRef = useRef<THREE.Points>(null)

    const { positions, velocities } = useMemo(() => {
        const pos = new Float32Array(particleCount * 3)
        const vel = new Float32Array(particleCount * 3)
        const col = new Float32Array(particleCount * 3)

        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const radius = 5 + Math.random() * 15

            pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
            pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
            pos[i * 3 + 2] = radius * Math.cos(phi)

            vel[i * 3] = (Math.random() - 0.5) * 0.02
            vel[i * 3 + 1] = (Math.random() - 0.5) * 0.02
            vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02

            // Gold color
            col[i * 3] = 1.0
            col[i * 3 + 1] = 0.7 + Math.random() * 0.3
            col[i * 3 + 2] = 0.0 + Math.random() * 0.3
        }

        return { positions: pos, velocities: vel, colors: col }
    }, [])

    useFrame((state) => {
        if (!particlesRef.current || !showTokenRewards) return

        const posAttr = particlesRef.current.geometry.attributes.position
        const pos = posAttr.array as Float32Array
        const time = state.clock.elapsedTime

        for (let i = 0; i < particleCount; i++) {
            const angle = time * 0.1 + i * 0.001

            pos[i * 3] += velocities[i * 3] + Math.sin(angle) * 0.005
            pos[i * 3 + 1] += velocities[i * 3 + 1] + Math.cos(angle * 0.7) * 0.003
            pos[i * 3 + 2] += velocities[i * 3 + 2] + Math.sin(angle * 0.5) * 0.004

            const newRadius = Math.sqrt(
                pos[i * 3] ** 2 + pos[i * 3 + 1] ** 2 + pos[i * 3 + 2] ** 2
            )

            if (newRadius > 25 || newRadius < 3) {
                const theta = Math.random() * Math.PI * 2
                const phi = Math.acos(2 * Math.random() - 1)
                const radius = 5 + Math.random() * 15

                pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
                pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
                pos[i * 3 + 2] = radius * Math.cos(phi)
            }
        }

        posAttr.needsUpdate = true
    })

    if (networkType !== 'presearch' && networkType !== 'hybrid') return null
    if (!showTokenRewards) return null

    return (
        <points ref={particlesRef} frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                color="#ffcc00"
                transparent
                opacity={0.7}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}

// Data flow particles for YaCy DHT
function DataFlowParticles() {
    const networkType = useNetworkStore((state) => state.networkType)
    const showDataFlow = useNetworkStore((state) => state.showDataFlow)

    const particleCount = 800
    const particlesRef = useRef<THREE.Points>(null)

    const positions = useMemo(() => {
        const pos = new Float32Array(particleCount * 3)

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2
            const layer = Math.floor((i % 100) / 20)
            const radius = 5 + layer * 2 + (Math.random() - 0.5) * 2

            pos[i * 3] = Math.cos(angle) * radius
            pos[i * 3 + 1] = (Math.random() - 0.5) * 6
            pos[i * 3 + 2] = Math.sin(angle) * radius
        }

        return pos
    }, [])

    useFrame((state) => {
        if (!particlesRef.current || !showDataFlow) return

        const time = state.clock.elapsedTime
        const posAttr = particlesRef.current.geometry.attributes.position
        const pos = posAttr.array as Float32Array

        for (let i = 0; i < particleCount; i++) {
            const currentAngle = Math.atan2(pos[i * 3 + 2], pos[i * 3])
            const radius = Math.sqrt(pos[i * 3] ** 2 + pos[i * 3 + 2] ** 2)
            const newAngle = currentAngle + 0.002 + (i % 5) * 0.0005

            pos[i * 3] = Math.cos(newAngle) * radius
            pos[i * 3 + 2] = Math.sin(newAngle) * radius
            pos[i * 3 + 1] += Math.sin(time + i * 0.1) * 0.005

            if (Math.abs(pos[i * 3 + 1]) > 8) {
                pos[i * 3 + 1] *= 0.9
            }
        }

        posAttr.needsUpdate = true
    })

    if (networkType !== 'yacy' && networkType !== 'hybrid') return null
    if (!showDataFlow) return null

    return (
        <points ref={particlesRef} frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.06}
                color="#44ff88"
                transparent
                opacity={0.6}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}

// Regional cluster visualization
function RegionalClusters() {
    const networkType = useNetworkStore((state) => state.networkType)
    const showRegions = useNetworkStore((state) => state.showRegions)

    const regions = useMemo(() => [
        { name: 'NA', center: [-8, 0, -5] as [number, number, number], color: '#00aaff', label: 'North America' },
        { name: 'EU', center: [0, 0, -3] as [number, number, number], color: '#44ff88', label: 'Europe' },
        { name: 'AS', center: [8, 0, -2] as [number, number, number], color: '#ff8844', label: 'Asia' },
        { name: 'SA', center: [-5, -3, 3] as [number, number, number], color: '#ff44aa', label: 'South America' },
        { name: 'AF', center: [2, -2, 2] as [number, number, number], color: '#ffaa44', label: 'Africa' },
        { name: 'OC', center: [10, -2, 4] as [number, number, number], color: '#aa44ff', label: 'Oceania' }
    ], [])

    if (networkType !== 'presearch' || !showRegions) return null

    return (
        <group>
            {regions.map((region) => (
                <group key={region.name} position={region.center}>
                    {/* Region sphere */}
                    <mesh>
                        <sphereGeometry args={[4, 16, 16]} />
                        <meshBasicMaterial
                            color={region.color}
                            transparent
                            opacity={0.03}
                            side={THREE.BackSide}
                        />
                    </mesh>

                    {/* Region label */}
                    <Html position={[0, 5, 0]} center>
                        <div style={{
                            color: region.color,
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            textShadow: '0 0 10px rgba(0,0,0,0.8)',
                            whiteSpace: 'nowrap'
                        }}>
                            {region.label}
                        </div>
                    </Html>

                    {/* Sparkles for activity */}
                    <Sparkles
                        count={30}
                        scale={8}
                        size={2}
                        speed={0.3}
                        color={region.color}
                        opacity={0.3}
                    />
                </group>
            ))}
        </group>
    )
}

// Network Statistics HUD
function NetworkStatsHUD() {
    const stats = useNetworkStore((state) => state.stats)
    const networkType = useNetworkStore((state) => state.networkType)

    return (
        <Html position={[-15, 10, 0]} center={false}>
            <div style={{
                background: 'rgba(0, 10, 30, 0.9)',
                border: '1px solid rgba(68, 136, 255, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                color: 'white',
                fontFamily: 'monospace',
                fontSize: '12px',
                minWidth: '180px'
            }}>
                <div style={{
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    color: '#4488ff',
                    fontSize: '14px',
                    borderBottom: '1px solid rgba(68, 136, 255, 0.3)',
                    paddingBottom: '8px'
                }}>
                    {networkType.toUpperCase()} Network
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>Nodes: <span style={{ color: '#4488ff' }}>{stats.totalNodes}</span></div>
                    <div>Active: <span style={{ color: '#44ff88' }}>{stats.activeNodes}</span></div>
                    <div>Connections: <span style={{ color: '#ffaa44' }}>{stats.totalConnections}</span></div>
                    <div>Avg Latency: <span style={{ color: '#ff8844' }}>{stats.averageLatency}ms</span></div>
                    <div>Documents: <span style={{ color: '#aa88ff' }}>{stats.documentsIndexed.toLocaleString()}</span></div>
                    <div>Health: <span style={{
                        color: stats.networkHealth > 80 ? '#44ff88' : stats.networkHealth > 50 ? '#ffaa44' : '#ff4444'
                    }}>{stats.networkHealth}%</span></div>
                </div>
            </div>
        </Html>
    )
}

// Main Network Visualization Component
export function NetworkVisualization() {
    const setMousePosition = useNetworkStore((state) => state.setMousePosition)
    const initializeNetwork = useNetworkStore((state) => state.initializeNetwork)
    const isInitialized = useNetworkStore((state) => state.isInitialized)
    const networkType = useNetworkStore((state) => state.networkType)

    const { camera, raycaster, pointer } = useThree()
    const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
    const intersectPoint = useRef(new THREE.Vector3())

    // Initialize network on mount
    useEffect(() => {
        if (!isInitialized) {
            initializeNetwork(networkType)
        }
    }, [isInitialized, networkType, initializeNetwork])

    useFrame(() => {
        raycaster.setFromCamera(pointer, camera)
        raycaster.ray.intersectPlane(planeRef.current, intersectPoint.current)
        setMousePosition([
            intersectPoint.current.x,
            intersectPoint.current.y,
            0
        ])
    })

    return (
        <group>
            {/* GPU-instanced nodes */}
            <InstancedNodes />

            {/* Connections */}
            <Connections />

            {/* Query visualization */}
            <QueryVisualization />

            {/* Token flow particles */}
            <TokenFlowParticles />

            {/* Data flow particles for YaCy */}
            <DataFlowParticles />

            {/* Regional clusters */}
            <RegionalClusters />

            {/* Node tooltip */}
            <NodeTooltip />

            {/* Network stats HUD */}
            <NetworkStatsHUD />

            {/* Central ambient light */}
            <pointLight position={[0, 0, 0]} color="#4488ff" intensity={3} distance={30} />
            <pointLight position={[0, 10, 0]} color="#ffffff" intensity={0.5} distance={25} />
        </group>
    )
}

export default NetworkVisualization
