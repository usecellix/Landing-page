import path from 'path'
import os from 'os'
import fs from 'fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Excel's Office dialog (client/src/auth/useAuth.ts) refuses non-HTTPS
// dialog URLs, so the login/register pages this site serves for the
// email/password flow must be reachable over HTTPS in dev too. Reuses the
// same locally-trusted cert the Excel add-in already generates via
// `office-addin-dev-certs` (see client/vite.config.ts) so Excel's WebView
// — stricter than a normal browser about self-signed certs — accepts it
// without extra setup.
const certPath = path.join(os.homedir(), '.office-addin-dev-certs', 'localhost.crt')
const keyPath = path.join(os.homedir(), '.office-addin-dev-certs', 'localhost.key')

let httpsConfig: { cert: Buffer; key: Buffer } | undefined
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  httpsConfig = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname), '')
  // Force IPv4 — on Windows, `localhost` can resolve to ::1 while Nest only
  // listens on 0.0.0.0 (IPv4), which surfaces as intermittent ECONNREFUSED.
  const backendTarget = env.VITE_BACKEND_TARGET || 'http://127.0.0.1:4001'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      https: httpsConfig,
      // Same pattern as client/vite.config.ts: browser stays on this HTTPS
      // origin; Nest stays plain HTTP. Without the proxy, the Landing tab
      // talks to http://localhost:4001 cross-site from https://localhost:5173,
      // so SameSite=Lax session cookies are not sent on get-session /
      // excel-login/complete — login appears to succeed then immediately
      // returns null (MANUAL_AUTH_IMPLEMENTATION.md root cause follow-up).
      proxy: {
        // Keep /api/auth prefix — Better Auth mounts at /api/auth on Nest.
        '/api/auth': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Match BETTER_AUTH_URL / Excel add-in origin so cookies and
              // redirects stay consistent with the task pane session jar.
              proxyReq.setHeader('x-forwarded-proto', 'https')
              proxyReq.setHeader('x-forwarded-host', 'localhost:3000')
            })
          },
        },
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (proxyPath) => proxyPath.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('x-forwarded-proto', 'https')
              proxyReq.setHeader('x-forwarded-host', 'localhost:3000')
            })
          },
        },
      },
    },
  }
})
