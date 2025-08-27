import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov', 'clover'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['dist/**', 'node_modules/**', 'tests/**', 'devtools/**', 'webpack.config.js', 'vitest.config.ts', 'src/types/**', 'src/index.ts'],
    },
  },
});
