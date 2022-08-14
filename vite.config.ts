import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';

const getAliases = (aliases: Array<[string, string]>): Record<string, string> => (
  Object.fromEntries(aliases.map(([alias, path]) => (
    [alias, fileURLToPath(new URL(path, import.meta.url))]
  )))
);

export default defineConfig({
  plugins: [
    react(),
    eslint(),
  ],
  base: '/osrs-stuff/',
  resolve: {
    alias: getAliases([
      ['@', './src'],
      ['@components', './src/components'],
      ['@views', './src/views'],
    ]),
  },
});
