# @woon-ui/react

## 0.3.0

### Minor Changes

- Replace provider/plugin-based runtime setup with direct runtime mounts.

  `@woon-ui/dialog`

  - Add `ModalRoot` as the dialog runtime mount.
  - Move `useDialog` into `@woon-ui/dialog`.
  - Remove `dialogPlugin`.

  `@woon-ui/toast`

  - Remove `toastPlugin`.
  - Standardize custom toast rendering around `<Toaster render={...} />`.

  `@woon-ui/react`

  - Remove `WoonProvider`.
  - Remove the provider/plugin-based runtime setup APIs from the umbrella package.
  - Keep `@woon-ui/react` as a convenience re-export package.
  - Re-export `ModalRoot` and the new dialog runtime API from `@woon-ui/dialog`.

  Migration summary:

  - Replace `WoonProvider` and plugin registration with direct `<ModalRoot />` and `<Toaster />` mounts at the app root.
  - Update dialog imports to come from `@woon-ui/dialog` when adopting feature-package imports.
  - Update object-style toast customization to use `<Toaster render={...} />` instead of `toastPlugin({ render })`.

### Patch Changes

- Updated dependencies
  - @woon-ui/dialog@0.3.0
  - @woon-ui/toast@0.2.0
  - @woon-ui/drawer@0.2.3

## 0.2.2

### Patch Changes

- Update package README documentation links to point to `woon-ui.vercel.app`.
- Updated dependencies
  - @woon-ui/combobox@0.1.2
  - @woon-ui/context-menu@0.1.2
  - @woon-ui/dialog@0.2.2
  - @woon-ui/drawer@0.2.2
  - @woon-ui/dropdown-menu@0.1.2
  - @woon-ui/popover@0.1.2
  - @woon-ui/primitive@0.1.2
  - @woon-ui/select@0.1.2
  - @woon-ui/toast@0.1.2
  - @woon-ui/tooltip@0.1.2

## 0.2.1

### Patch Changes

- Updated dependencies [bea7175]
  - @woon-ui/combobox@0.1.1
  - @woon-ui/context-menu@0.1.1
  - @woon-ui/dropdown-menu@0.1.1
  - @woon-ui/popover@0.1.1
  - @woon-ui/primitive@0.1.1
  - @woon-ui/select@0.1.1
  - @woon-ui/toast@0.1.1
  - @woon-ui/tooltip@0.1.1
  - @woon-ui/dialog@0.2.1
  - @woon-ui/drawer@0.2.1

## 0.2.0

### Minor Changes

- a7b5d65: Remove BottomSheet from the React umbrella package and workspace.

  `@woon-ui/react` no longer re-exports `BottomSheet`, the `@woon-ui/react/bottom-sheet`
  subpath has been removed, and `@woon-ui/react/css` no longer includes bottom-sheet styles.

  Use `Drawer` instead. For mobile sheets, migrate to `Drawer` with
  `direction="bottom"` and `dragToClose`.

### Patch Changes

- Updated dependencies [f8b3682]
- Updated dependencies [f8b3682]
  - @woon-ui/dialog@0.2.0
  - @woon-ui/drawer@0.2.0

## 0.1.1

### Patch Changes
