import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// This repository is published at https://behnamzarei20-arch.github.io/bbberah/.
// Use the explicit project path so production assets always resolve from that URL.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const configuredDemoFlag = env.VITE_ENABLE_ADMIN_DEMO_DATA;
  const enableAdminDemoData = configuredDemoFlag === 'true' ||
    (configuredDemoFlag === undefined && mode === 'development');

  return {
  base: '/bbberah/',
  plugins: [react()],
  resolve: {
    alias: {
      '@/features/admin/demoData': fileURLToPath(new URL(
        enableAdminDemoData ? './src/features/admin/demoData.ts' : './src/features/admin/emptyDemoData.ts',
        import.meta.url,
      )),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  };
});
