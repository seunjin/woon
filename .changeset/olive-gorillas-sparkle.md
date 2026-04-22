---
'@woon-ui/react': major
---

Remove BottomSheet from the React umbrella package and workspace.

`@woon-ui/react` no longer re-exports `BottomSheet`, the `@woon-ui/react/bottom-sheet`
subpath has been removed, and `@woon-ui/react/css` no longer includes bottom-sheet styles.

Use `Drawer` instead. For mobile sheets, migrate to `Drawer` with
`direction="bottom"` and `dragToClose`.
