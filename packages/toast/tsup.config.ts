import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.tsx' },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom', '@woon-ui/primitive'],
  treeshake: true,
  sourcemap: true,
})
