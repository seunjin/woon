# @woon-ui/toast

## 0.2.0

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

## 0.1.2

### Patch Changes

- Update package README documentation links to point to `woon-ui.vercel.app`.
- Updated dependencies
  - @woon-ui/primitive@0.1.2

## 0.1.1

### Patch Changes

- bea7175: Republish packages to sync the newly added npm README files.
- Updated dependencies [bea7175]
  - @woon-ui/primitive@0.1.1
