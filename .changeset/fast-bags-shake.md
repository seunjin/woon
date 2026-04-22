---
'@woon-ui/drawer': minor
---

Refactor Drawer to be a standalone edge-attached surface built on the Dialog
engine, with independent styling selectors and expanded drag-to-close support.

- remove the `size` prop and default size CSS contract
- stop exposing `data-woon-dialog-*` selectors on Drawer DOM
- support drag-to-close for `top`, `bottom`, `left`, and `right`
- make Drawer CSS self-contained instead of depending on Dialog base styles
