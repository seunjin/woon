import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.tsx',
    'overlay/dialog/index': 'src/overlay/dialog/index.tsx',
    'overlay/popover/index': 'src/overlay/popover/index.tsx',
    'overlay/tooltip/index': 'src/overlay/tooltip/index.tsx',
    'overlay/dropdown-menu/index': 'src/overlay/dropdown-menu/index.tsx',
    'overlay/context-menu/index': 'src/overlay/context-menu/index.tsx',
    'overlay/select/index': 'src/overlay/select/index.tsx',
    'overlay/combobox/index': 'src/overlay/combobox/index.tsx',
    'toast/index': 'src/toast/index.tsx',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
  sourcemap: true,
})
