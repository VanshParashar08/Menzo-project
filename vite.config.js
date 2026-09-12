import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        generator: resolve(__dirname, 'generator.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        faq: resolve(__dirname, 'faq.html'),
        features: resolve(__dirname, 'features.html'),
        getStarted: resolve(__dirname, 'get-started.html'),
        choosePlan: resolve(__dirname, 'choose-plan.html'),
        setupMenu: resolve(__dirname, 'setup-menu.html'),
        previewGoLive: resolve(__dirname, 'preview-golive.html'),
      },
    },
  },
});
