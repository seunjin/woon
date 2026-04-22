# @woon-ui/drawer

## 0.2.4

### Patch Changes

- Updated dependencies
  - @woon-ui/dialog@0.4.0

## 0.2.3

### Patch Changes

- Updated dependencies
  - @woon-ui/dialog@0.3.0

## 0.2.2

### Patch Changes

- Update package README documentation links to point to `woon-ui.vercel.app`.
- Updated dependencies
  - @woon-ui/dialog@0.2.2
  - @woon-ui/primitive@0.1.2

## 0.2.1

### Patch Changes

- Updated dependencies [bea7175]
  - @woon-ui/primitive@0.1.1
  - @woon-ui/dialog@0.2.1

## 0.2.0

### Minor Changes

- f8b3682: Refactor Drawer to be a standalone edge-attached surface built on the Dialog
  engine, with independent styling selectors and expanded drag-to-close support.

  - remove the `size` prop and default size CSS contract
  - stop exposing `data-woon-dialog-*` selectors on Drawer DOM
  - support drag-to-close for `top`, `bottom`, `left`, and `right`
  - make Drawer CSS self-contained instead of depending on Dialog base styles

### Patch Changes

- Updated dependencies [f8b3682]
  - @woon-ui/dialog@0.2.0

## 0.1.0

- initial drawer package scaffold
