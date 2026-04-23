import type { FeatureDefinition, FeatureName } from './types'

export const FEATURE_NAMES = [
  'dialog',
  'toast',
  'drawer',
  'tooltip',
  'popover',
  'dropdown-menu',
  'context-menu',
  'select',
  'combobox',
] as const satisfies readonly FeatureName[]

export const FEATURES: Record<FeatureName, FeatureDefinition> = {
  dialog: {
    name: 'dialog',
    packageName: '@woon-ui/dialog',
    exportName: 'Dialog',
    template: 'dialog',
    runtime: {
      packageName: '@woon-ui/dialog',
      importName: 'DialogRuntime',
      note: 'Mount <DialogRuntime /> once at your app root before calling useDialog(), alert(), or confirm().',
    },
  },
  toast: {
    name: 'toast',
    packageName: '@woon-ui/toast',
    exportName: 'Toast',
    template: 'toast',
    runtime: {
      packageName: '@woon-ui/toast',
      importName: 'Toaster',
      note: 'Mount <Toaster render={Toast} /> once at your app root before calling toast().',
    },
  },
  drawer: {
    name: 'drawer',
    packageName: '@woon-ui/drawer',
    exportName: 'Drawer',
    template: 're-export',
  },
  tooltip: {
    name: 'tooltip',
    packageName: '@woon-ui/tooltip',
    exportName: 'Tooltip',
    template: 're-export',
  },
  popover: {
    name: 'popover',
    packageName: '@woon-ui/popover',
    exportName: 'Popover',
    template: 're-export',
  },
  'dropdown-menu': {
    name: 'dropdown-menu',
    packageName: '@woon-ui/dropdown-menu',
    exportName: 'DropdownMenu',
    template: 're-export',
  },
  'context-menu': {
    name: 'context-menu',
    packageName: '@woon-ui/context-menu',
    exportName: 'ContextMenu',
    template: 're-export',
  },
  select: {
    name: 'select',
    packageName: '@woon-ui/select',
    exportName: 'Select',
    template: 're-export',
  },
  combobox: {
    name: 'combobox',
    packageName: '@woon-ui/combobox',
    exportName: 'Combobox',
    template: 're-export',
  },
}

export function getFeature(name: string): FeatureDefinition | undefined {
  return FEATURES[name as FeatureName]
}
