import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, isPreview }) => {
  const serverConfig = {}

  if (command === 'serve' && !isPreview) {
    const target = loadEnv(mode, '.', '').API_PROXY_TARGET?.trim()

    if (!target) {
      throw new Error('Defina API_PROXY_TARGET em .env.local para iniciar o proxy de desenvolvimento.')
    }

    let targetUrl

    try {
      targetUrl = new URL(target)
    } catch {
      throw new Error('API_PROXY_TARGET precisa ser uma URL válida.')
    }

    if (
      !['http:', 'https:'].includes(targetUrl.protocol) ||
      targetUrl.username ||
      targetUrl.password ||
      targetUrl.pathname !== '/' ||
      targetUrl.search ||
      targetUrl.hash
    ) {
      throw new Error('API_PROXY_TARGET deve conter apenas a origem HTTP(S), sem credenciais, caminho ou query.')
    }

    serverConfig.proxy = {
      '/api-proxy': {
        target: targetUrl.origin,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, '') || '/',
      },
    }
  }

  return {
    plugins: [react(), VitePWA({
      registerType: 'prompt',
      injectRegister: false,

      manifest: {
        name: 'Hephaistos Requests',
        short_name: 'Hephaistos Requests',
        description: 'Hephaistos Requests',
        theme_color: '#4f46e5',

        icons: [{
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png',
        }, {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        }, {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        }, {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        }],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },

      devOptions: {
        enabled: false,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module',
      },
    })],
    server: serverConfig,
  }
})