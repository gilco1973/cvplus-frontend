import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/components/index.ts',
    'src/hooks/index.ts',
    'src/contexts/index.ts',
    'src/types/index.ts',
    'src/utils/index.ts',
    'src/providers/index.ts'
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom'],
  target: 'es2020',
  minify: false,
  sourcemap: true,
  splitting: false,
});