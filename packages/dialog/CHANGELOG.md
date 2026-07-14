# @woon-ui/dialog

## 0.4.0

### Minor Changes

- Rename the app-level dialog runtime export from `ModalRoot` to `DialogRuntime`.

  Update docs and examples to use `DialogRuntime` for the app-level dialog runtime mount.

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

## 0.2.2

### Patch Changes

- Update package README documentation links to point to `woon-ui.vercel.app`.
- Updated dependencies
  - @woon-ui/primitive@0.1.2

## 0.2.1

### Patch Changes

- Updated dependencies [bea7175]
  - @woon-ui/primitive@0.1.1

## 0.2.0

### Minor Changes

- f8b3682: Split the Dialog family styling contracts so `Dialog`, `alert()`, and `confirm()`
  no longer share the same content and overlay selectors.

  `dialog-base.css` has been removed. `dialog.css`, `alert.css`, and `confirm.css`
  are now self-contained entry points with distinct data attribute selectors for
  their DOM surfaces.
