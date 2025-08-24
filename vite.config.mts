import { defineConfig } from 'vite';
import { builtinModules } from 'node:module';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

export default defineConfig(({ mode }) => ({
  define: {
    EXTENSION_NAME: JSON.stringify(pkg.name),
    EXTENSION_VERSION: JSON.stringify(pkg.version),
    EXTENSION_BUILD_TIME: JSON.stringify(Date.now()),
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: mode === 'production' ? 'src/index.ts' : 'src/main.ts',
      name: pkg.name,
  formats: ['cjs'],
  fileName: () => 'main.cjs',
    },
    rollupOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        'bufferutil',
        'utf-8-validate',
        /.*\/build\/.*\/(validation|bufferutil)/,
      ],
      output: {
        exports: 'auto',
      },
    },
    target: 'node18',
  minify: mode === 'production' ? 'esbuild' : false,
  },
}));
