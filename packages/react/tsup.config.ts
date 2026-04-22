import { defineConfig } from 'tsup'

const external = [
  'react',
  'react-dom',
  '@woon-ui/primitive',
  '@woon-ui/drawer',
  '@woon-ui/dialog',
  '@woon-ui/toast',
  '@woon-ui/tooltip',
  '@woon-ui/popover',
  '@woon-ui/dropdown-menu',
  '@woon-ui/context-menu',
  '@woon-ui/select',
  '@woon-ui/combobox',
]

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    drawer: 'src/drawer.ts',
    dialog: 'src/dialog.ts',
    toast: 'src/toast.ts',
    tooltip: 'src/tooltip.ts',
    popover: 'src/popover.ts',
    'dropdown-menu': 'src/dropdown-menu.ts',
    'context-menu': 'src/context-menu.ts',
    select: 'src/select.ts',
    combobox: 'src/combobox.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external,
  treeshake: true,
  sourcemap: true,
})
