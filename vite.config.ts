// Vite Configuration for Network Search Visualization
// This config provides a development server with proxy for YaCy API

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
    // Load environment variables
    const env = loadEnv(mode, process.cwd(), '')

    // YaCy server URL - defaults to localhost:8090
    const YACY_URL = env.VITE_YACY_URL || 'http://localhost:8090'

    return {
        plugins: [react()],

        // Root directory for the network app
        root: path.resolve(__dirname, 'network-app'),

        // Development server configuration
        server: {
            port: 3000,
            host: true,
            open: true,

            // Proxy configuration for YaCy API
            proxy: {
                // Main YaCy API proxy
                '/yacy-api': {
                    target: YACY_URL,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/yacy-api/, ''),
                    secure: false,
                    // Handle connection errors gracefully
                    configure: (proxy, _options) => {
                        proxy.on('error', (err, _req, res) => {
                            console.error('YaCy Proxy Error:', err.message)
                            if (res && 'writeHead' in res) {
                                res.writeHead(502, {
                                    'Content-Type': 'application/json'
                                })
                                res.end(JSON.stringify({
                                    error: 'YaCy server not reachable',
                                    message: err.message,
                                    hint: `Make sure YaCy is running at ${YACY_URL}`
                                }))
                            }
                        })
                        proxy.on('proxyReq', (proxyReq, req, _res) => {
                            console.log(`[YaCy Proxy] ${req.method} ${req.url} -> ${YACY_URL}`)
                        })
                        proxy.on('proxyRes', (proxyRes, req, _res) => {
                            console.log(`[YaCy Proxy] ${proxyRes.statusCode} ${req.url}`)
                        })
                    }
                },

                // SearXNG proxy (if configured)
                '/searxng-api': {
                    target: env.VITE_SEARXNG_URL || 'http://localhost:8888',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/searxng-api/, ''),
                    secure: false,
                    configure: (proxy, _options) => {
                        proxy.on('error', (err, _req, res) => {
                            console.error('SearXNG Proxy Error:', err.message)
                            if (res && 'writeHead' in res) {
                                res.writeHead(502, {
                                    'Content-Type': 'application/json'
                                })
                                res.end(JSON.stringify({
                                    error: 'SearXNG server not reachable',
                                    message: err.message
                                }))
                            }
                        })
                    }
                },

                // Meilisearch proxy (if configured)
                '/meilisearch-api': {
                    target: env.VITE_MEILISEARCH_URL || 'http://localhost:7700',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/meilisearch-api/, ''),
                    secure: false,
                    configure: (proxy, _options) => {
                        proxy.on('error', (err, _req, res) => {
                            console.error('Meilisearch Proxy Error:', err.message)
                            if (res && 'writeHead' in res) {
                                res.writeHead(502, {
                                    'Content-Type': 'application/json'
                                })
                                res.end(JSON.stringify({
                                    error: 'Meilisearch server not reachable',
                                    message: err.message
                                }))
                            }
                        })
                    }
                }
            },

            // CORS headers for development
            cors: true
        },

        // Build configuration
        build: {
            outDir: path.resolve(__dirname, 'dist-network'),
            sourcemap: true,
            rollupOptions: {
                output: {
                    manualChunks: {
                        'three': ['three'],
                        'react-three': ['@react-three/fiber', '@react-three/drei'],
                        'vendor': ['react', 'react-dom', 'zustand']
                    }
                }
            }
        },

        // Path aliases
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@components': path.resolve(__dirname, './components'),
                '@stores': path.resolve(__dirname, './src/stores'),
                '@services': path.resolve(__dirname, './src/services')
            }
        },

        // Environment variable prefix
        envPrefix: 'VITE_',

        // Optimizations
        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                'three',
                '@react-three/fiber',
                '@react-three/drei',
                'zustand'
            ]
        },

        // Define global constants
        define: {
            __YACY_URL__: JSON.stringify(YACY_URL)
        }
    }
})
