import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    
    // CSS Configuration
    css: {
      postcss: './postcss.config.js',
    },
    
    // Path Resolution
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@services': path.resolve(__dirname, './src/services'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@config': path.resolve(__dirname, './src/config'),
        '@styles': path.resolve(__dirname, './src/styles'),
      },
    },
    
    // Build Configuration
    build: {
      target: 'esnext',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            vendor: ['react', 'react-dom'],
            radix: [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-slot',
              '@radix-ui/react-switch',
              '@radix-ui/react-scroll-area',
            ],
            lucide: ['lucide-react'],
          },
        },
      },
    },
    
    // Development Server Configuration
    server: {
      port: parseInt(env.VITE_DEV_PORT) || 8082,
      open: true,
      cors: true,
      proxy: mode === 'development' ? {
        // Proxy API requests during development
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:5679',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/oauth': {
          target: env.VITE_OAUTH_CALLBACK_URL || 'http://localhost:8003',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/oauth/, ''),
        },
      } : undefined,
    },
    
    // Preview Configuration
    preview: {
      port: parseInt(env.VITE_PREVIEW_PORT) || 4173,
      open: true,
    },
    
    // Environment Variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    
    // Optimizations
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'lucide-react',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
      ],
    },
  };
});