import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 5173,
    host: true,
  },
  plugins: [
    {
      name: 'menu-url-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/menu' || req.url.startsWith('/menu?')) {
            req.url = req.url.replace('/menu', '/menu.html');
          }
          if (req.url === '/login' || req.url.startsWith('/login?')) {
            req.url = req.url.replace('/login', '/login.html');
          }
          next();
        });
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        generator: resolve(__dirname, 'generator.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        faq: resolve(__dirname, 'faq.html'),
        features: resolve(__dirname, 'features.html'),
        getStarted: resolve(__dirname, 'get-started.html'),
        login: resolve(__dirname, 'login.html'),
        choosePlan: resolve(__dirname, 'choose-plan.html'),
        setupMenu: resolve(__dirname, 'setup-menu.html'),
        previewGoLive: resolve(__dirname, 'preview-golive.html'),
        menu: resolve(__dirname, 'menu.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      },
    },
  },
});
