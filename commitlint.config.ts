import type { UserConfig } from '@commitlint/types'

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        // 패키지
        'seum',
        'docs',
        // 컴포넌트
        'dialog',
        'popover',
        'tooltip',
        'toast',
        'drawer',
        'field',
        'input',
        'textarea',
        'select',
        'combobox',
        'checkbox',
        'radio',
        'switch',
        'tabs',
        'accordion',
        'collapsible',
        // 코어
        'core',
        'overlay-engine',
        'field-engine',
        'css',
      ],
    ],
  },
}

export default config
