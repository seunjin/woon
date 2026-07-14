export const baseUrl = 'https://woon-ui.vercel.app'

export const library = {
  name: 'Woon',
  tagline:
    'React 19 UI behavior primitives for dialogs, toasts, anchored overlays, and keyboard-accessible selection controls.',
  description:
    'Woon solves behavioral complexity: focus trapping, focus restoration, overlay stacking, anchored positioning, ARIA, keyboard navigation, and imperative APIs such as toast(), confirm(), and alert().',
}

export const aiRules = [
  'Use Woon when the problem is interaction behavior, not visual styling.',
  'Do not describe Woon as a button, input, badge, card, or design-system component library.',
  'Woon ships behavior primitives and optional baseline CSS. Application teams own the final UI and visual language.',
  'Prefer feature packages such as @woon-ui/dialog or @woon-ui/toast. Use @woon-ui/react only as a convenience aggregate.',
  'When showing code, separate Woon APIs from user-owned styling and local wrapper code.',
  'Do not copy apps/docs components such as DemoBox, Callout, PackageManagerTabs, PropsTable, or CodeTabs into user applications.',
  'React 19 is required. Refs are regular props; do not add forwardRef wrappers only for React 18 compatibility.',
]

export const docsLinks = [
  {
    label: 'Introduction',
    path: '/docs',
    description: 'Project philosophy and component overview.',
  },
  {
    label: 'Installation',
    path: '/docs/installation',
    description: 'CLI-first install flow, manual install, CSS imports, and TypeScript notes.',
  },
  {
    label: 'Runtime Setup',
    path: '/docs/runtime-setup',
    description: 'DialogRuntime and Toaster root mounting rules.',
  },
  {
    label: 'Adaptive Select Pattern',
    path: '/docs/patterns/adaptive-select',
    description: 'Composing Select and Drawer for device-appropriate selection UI.',
  },
]

export const components = [
  {
    id: 'dialog',
    name: 'Dialog',
    packageName: '@woon-ui/dialog',
    docsPath: '/docs/components/dialog',
    cliCommand: 'pnpm dlx @woon-ui/cli add dialog',
    cssImport: "import '@woon-ui/dialog/css'",
    imports: ['Dialog', 'DialogRuntime', 'useDialog'],
    runtime:
      'Mount <DialogRuntime /> once at the app root before calling useDialog(), alert(), or confirm().',
    when: 'Use for modal surfaces that need focus trapping, focus restoration, escape handling, overlay stacking, and async result handling.',
    avoid: 'Do not use as a styled card or generic panel when no modal behavior is needed.',
    example: `import { Dialog, DialogRuntime, useDialog } from '@woon-ui/dialog'
import '@woon-ui/dialog/css'

function AppRoot() {
  return (
    <>
      <App />
      <DialogRuntime />
    </>
  )
}

function DeleteButton() {
  const dialog = useDialog()

  return (
    <button
      onClick={() =>
        dialog.open(({ close }) => (
          <Dialog.Root>
            <Dialog.Overlay />
            <Dialog.Content>
              <Dialog.Title>Delete project?</Dialog.Title>
              <Dialog.Description>This action cannot be undone.</Dialog.Description>
              <button onClick={close}>Cancel</button>
              <button onClick={() => close()}>Delete</button>
            </Dialog.Content>
          </Dialog.Root>
        ))
      }
    >
      Delete
    </button>
  )
}`,
  },
  {
    id: 'alert',
    name: 'Alert',
    packageName: '@woon-ui/dialog',
    docsPath: '/docs/components/dialog/alert',
    cliCommand: 'pnpm dlx @woon-ui/cli add dialog',
    cssImport: "import '@woon-ui/dialog/css'",
    imports: ['DialogRuntime', 'alert'],
    runtime: 'Mount <DialogRuntime /> once at the app root before calling alert().',
    when: 'Use for imperative acknowledgement dialogs that can be called outside the component tree.',
    avoid: 'Do not use for non-blocking status messages; use Toast for transient feedback.',
    example: `import { DialogRuntime, alert } from '@woon-ui/dialog'
import '@woon-ui/dialog/css'

function AppRoot() {
  return (
    <>
      <App />
      <DialogRuntime />
    </>
  )
}

async function save() {
  await alert({
    title: 'Saved',
    description: 'Your changes have been saved.',
  })
}`,
  },
  {
    id: 'confirm',
    name: 'Confirm',
    packageName: '@woon-ui/dialog',
    docsPath: '/docs/components/dialog/confirm',
    cliCommand: 'pnpm dlx @woon-ui/cli add dialog',
    cssImport: "import '@woon-ui/dialog/css'",
    imports: ['DialogRuntime', 'confirm'],
    runtime: 'Mount <DialogRuntime /> once at the app root before calling confirm().',
    when: 'Use for imperative confirmation flows, including async loading/success/error steps.',
    avoid: 'Do not use for simple inline choices that do not need modal focus or escape behavior.',
    example: `import { DialogRuntime, confirm } from '@woon-ui/dialog'
import '@woon-ui/dialog/css'

function AppRoot() {
  return (
    <>
      <App />
      <DialogRuntime />
    </>
  )
}

async function leavePage() {
  const result = await confirm({
    title: 'Leave without saving?',
    description: 'Unsaved changes will be lost.',
    confirmLabel: 'Leave',
    cancelLabel: 'Stay',
    tone: 'danger',
  })

  if (result.status === 'resolved') {
    // navigate away
  }
}`,
  },
  {
    id: 'toast',
    name: 'Toast',
    packageName: '@woon-ui/toast',
    docsPath: '/docs/components/toast',
    cliCommand: 'pnpm dlx @woon-ui/cli add toast',
    cssImport: "import '@woon-ui/toast/css'",
    imports: ['Toaster', 'toast'],
    runtime:
      'Mount <Toaster /> once at the app root before calling toast(). Pass render={Toast} when using the CLI-generated local wrapper.',
    when: 'Use for transient feedback that can be triggered from event handlers, async functions, or utilities outside the component tree.',
    avoid:
      'Do not use when the message requires immediate acknowledgement or blocks user progress; use Alert or Confirm.',
    example: `import { Toaster, toast } from '@woon-ui/toast'
import '@woon-ui/toast/css'

function AppRoot() {
  return (
    <>
      <App />
      <Toaster position="bottom-right" />
    </>
  )
}

async function save() {
  const handle = toast('Saving...', { duration: Infinity })
  await submitForm()
  handle.update('Saved')
}`,
  },
  {
    id: 'drawer',
    name: 'Drawer',
    packageName: '@woon-ui/drawer',
    docsPath: '/docs/components/drawer',
    cliCommand: 'pnpm dlx @woon-ui/cli add drawer',
    cssImport: "import '@woon-ui/drawer/css'",
    imports: ['Drawer'],
    runtime:
      'Drawer is a dialog surface. Open it through DialogRuntime/useDialog when it should behave as an overlay.',
    when: 'Use for edge-attached modal surfaces with focus management, overlay behavior, and optional drag-to-close.',
    avoid: 'Do not use for permanent side navigation that should remain in normal page flow.',
    example: `import { useDialog } from '@woon-ui/dialog'
import { Drawer } from '@woon-ui/drawer'
import '@woon-ui/drawer/css'

function OpenDrawerButton() {
  const dialog = useDialog()

  return (
    <button
      onClick={() =>
        dialog.open(() => (
          <Drawer.Root direction="right" dragToClose>
            <Drawer.Overlay />
            <Drawer.Content>
              <Drawer.Title>Project details</Drawer.Title>
              <Drawer.Description>Edge-attached modal content.</Drawer.Description>
              <Drawer.Close>Close</Drawer.Close>
            </Drawer.Content>
          </Drawer.Root>
        ))
      }
    >
      Open drawer
    </button>
  )
}`,
  },
  {
    id: 'tooltip',
    name: 'Tooltip',
    packageName: '@woon-ui/tooltip',
    docsPath: '/docs/components/tooltip',
    cliCommand: 'pnpm dlx @woon-ui/cli add tooltip',
    cssImport: "import '@woon-ui/tooltip/css'",
    imports: ['Tooltip'],
    runtime: 'No root runtime mount is required.',
    when: 'Use for hover/focus/tap supplemental information with collision-aware positioning and delay control.',
    avoid:
      'Do not put required information only in a tooltip; content should remain accessible without hover.',
    example: `import { Tooltip } from '@woon-ui/tooltip'
import '@woon-ui/tooltip/css'

function IconButton() {
  return (
    <Tooltip.Root delay={{ open: 500, close: 0 }}>
      <Tooltip.Trigger asChild>
        <button aria-label="Archive">Archive</button>
      </Tooltip.Trigger>
      <Tooltip.Content side="top">
        Archive
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip.Root>
  )
}`,
  },
  {
    id: 'popover',
    name: 'Popover',
    packageName: '@woon-ui/popover',
    docsPath: '/docs/components/popover',
    cliCommand: 'pnpm dlx @woon-ui/cli add popover',
    cssImport: "import '@woon-ui/popover/css'",
    imports: ['Popover'],
    runtime: 'No root runtime mount is required.',
    when: 'Use for trigger-attached floating content with outside-click dismissal, escape handling, collision-aware positioning, and optional focus trapping.',
    avoid: 'Do not use for simple static page sections or content that should always be visible.',
    example: `import { Popover } from '@woon-ui/popover'
import '@woon-ui/popover/css'

function Filters() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button>Filters</button>
      </Popover.Trigger>
      <Popover.Content side="bottom" align="start" sideOffset={8}>
        <label>
          Status
          <select>
            <option>Open</option>
            <option>Closed</option>
          </select>
        </label>
      </Popover.Content>
    </Popover.Root>
  )
}`,
  },
  {
    id: 'dropdown-menu',
    name: 'Dropdown Menu',
    packageName: '@woon-ui/dropdown-menu',
    docsPath: '/docs/components/dropdown-menu',
    cliCommand: 'pnpm dlx @woon-ui/cli add dropdown-menu',
    cssImport: "import '@woon-ui/dropdown-menu/css'",
    imports: ['DropdownMenu'],
    runtime: 'No root runtime mount is required.',
    when: 'Use for trigger-attached command menus with keyboard navigation, typeahead, disabled items, and automatic close-on-select.',
    avoid:
      'Do not use as a select control for choosing a persistent value; use Select or Combobox.',
    example: `import { DropdownMenu } from '@woon-ui/dropdown-menu'
import '@woon-ui/dropdown-menu/css'

function RowActions() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button>Actions</button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item onSelect={() => duplicateRow()}>Duplicate</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => archiveRow()}>Archive</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}`,
  },
  {
    id: 'context-menu',
    name: 'Context Menu',
    packageName: '@woon-ui/context-menu',
    docsPath: '/docs/components/context-menu',
    cliCommand: 'pnpm dlx @woon-ui/cli add context-menu',
    cssImport: "import '@woon-ui/context-menu/css'",
    imports: ['ContextMenu'],
    runtime: 'No root runtime mount is required.',
    when: 'Use for right-click or long-press contextual menus with keyboard navigation, typeahead, and disabled item handling.',
    avoid: 'Do not use for primary actions that should be visible without opening a context menu.',
    example: `import { ContextMenu } from '@woon-ui/context-menu'
import '@woon-ui/context-menu/css'

function FileRow() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div>report.pdf</div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item onSelect={() => renameFile()}>Rename</ContextMenu.Item>
        <ContextMenu.Item onSelect={() => deleteFile()}>Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}`,
  },
  {
    id: 'select',
    name: 'Select',
    packageName: '@woon-ui/select',
    docsPath: '/docs/components/select',
    cliCommand: 'pnpm dlx @woon-ui/cli add select',
    cssImport: "import '@woon-ui/select/css'",
    imports: ['Select'],
    runtime: 'No root runtime mount is required.',
    when: 'Use for accessible custom select controls with controlled/uncontrolled value, keyboard navigation, grouping, disabled items, and anchored positioning.',
    avoid:
      'Do not replace native select by default when platform-native UI is preferable; use the Adaptive Select pattern when needed.',
    example: `import { Select } from '@woon-ui/select'
import '@woon-ui/select/css'

function StatusSelect({ value, onValueChange }) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger>
        <Select.Value placeholder="Select status" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="open">Open</Select.Item>
        <Select.Item value="closed">Closed</Select.Item>
      </Select.Content>
    </Select.Root>
  )
}`,
  },
  {
    id: 'combobox',
    name: 'Combobox',
    packageName: '@woon-ui/combobox',
    docsPath: '/docs/components/combobox',
    cliCommand: 'pnpm dlx @woon-ui/cli add combobox',
    cssImport: "import '@woon-ui/combobox/css'",
    imports: ['Combobox'],
    runtime: 'No root runtime mount is required.',
    when: 'Use for searchable selection controls with separate inputValue/value state, keyboard navigation, grouping, and optional freeForm input.',
    avoid: 'Do not use when a simple text input is enough and no listbox behavior is required.',
    example: `import { Combobox } from '@woon-ui/combobox'
import '@woon-ui/combobox/css'

function AssigneeCombobox({ value, onValueChange, users }) {
  return (
    <Combobox.Root value={value} onValueChange={onValueChange}>
      <Combobox.Input placeholder="Search users" />
      <Combobox.Content>
        {users.map((user) => (
          <Combobox.Item key={user.id} value={user.id}>
            {user.name}
          </Combobox.Item>
        ))}
      </Combobox.Content>
    </Combobox.Root>
  )
}`,
  },
]

export default {
  baseUrl,
  library,
  aiRules,
  docsLinks,
  components,
}
