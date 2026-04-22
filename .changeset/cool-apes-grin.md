---
'@woon-ui/dialog': minor
---

Split the Dialog family styling contracts so `Dialog`, `alert()`, and `confirm()`
no longer share the same content and overlay selectors.

`dialog-base.css` has been removed. `dialog.css`, `alert.css`, and `confirm.css`
are now self-contained entry points with distinct data attribute selectors for
their DOM surfaces.
