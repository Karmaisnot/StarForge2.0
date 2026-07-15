import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the StarForge console SPA.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiProxyTarget = String(env.VITE_API_PROXY_TARGET || '').replace(/\/+$/, '');

  return {
    plugins: [react()],
    // The production console should share its tenant origin with the API. During
    // local development this proxy keeps the browser same-origin, so the tenant
    // API does not need to expose a permissive CORS policy just for Vite.
    server: {
      port: 5173,
      host: true,
      ...(apiProxyTarget
        ? {
            proxy: {
              '/api': {
                target: apiProxyTarget,
                changeOrigin: true,
                secure: true,
              },
            },
          }
        : {}),
    },
    preview: { port: 4173, host: true },
    build: { outDir: 'dist', sourcemap: false },
  };
});
