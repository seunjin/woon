# @woon-ui/react

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
