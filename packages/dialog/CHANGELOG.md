# @woon-ui/dialog

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
