# AGENTS.md

Guidance for AI/software agents working in this repository.

## Repository Purpose

This is a standalone Mailspring plugin. It adds a `Mark All as Read` action when a user right-clicks an `Inbox` item in Mailspring's account sidebar.

Mailspring's built-in `Edit > Mark All as Read` command has been observed to act only on unread threads currently loaded in the visible thread list. This plugin queries all unread threads in the clicked inbox category and queues Mailspring's native unread-state tasks.

## Important Context

- The repository remote is `git@github-visorcraft:visorcraft/mailspring_inbox_rightclick.git`.
- Use the `master` branch. Do not rename it to `main`.
- Use the VisorCraft git identity/SSH setup, consistent with `/work/repos/visorcraft/grexa`.
- The plugin is intentionally dependency-free CommonJS loaded directly by Mailspring.
- Do not add a build step unless there is a strong reason. Mailspring loads `package.json` -> `main` directly.
- Do not commit generated archives such as `*.tgz`.

## Mailspring API Caveat

Mailspring does not currently expose a first-class plugin API for adding items to existing account-sidebar context menus. This plugin uses a narrow DOM-level `contextmenu` capture hook against sidebar tree items:

- It only intercepts recognized Inbox rows.
- It supports the unified `Inbox` and nested per-account inbox rows.
- It leaves other sidebar context menus alone.
- For a single inbox, it preserves Mailspring's existing `Export folder as .eml files...` action.

If future Mailspring versions add a proper sidebar context-menu extension API, prefer that over the DOM hook.

## Local Troubleshooting History

During initial investigation, a local Flatpak install of Mailspring 1.21.0 was patched directly by editing/repacking `app.asar` to prove the behavior could work inside the built-in sidebar menu. That direct `app.asar` patch is not part of this open-source plugin and should not be documented as an install method for users.

For stale unread badges that do not correspond to unread threads, the correct user-facing advice is Mailspring `Preferences > General > Local Data > Reset Cache`. That rebuilds Mailspring's local `edgehill.db` cache without deleting accounts/settings.

## File Layout

- `package.json`: Mailspring plugin metadata plus `npm test`.
- `lib/main.js`: plugin implementation.
- `README.md`: user-facing documentation.
- `LICENSE`: MIT license.

## Development

Run the syntax check before committing:

```bash
npm test
```

Optional packaging smoke test:

```bash
npm pack --dry-run
```

## Commit/Push Expectations

Keep commits focused and signed using the existing VisorCraft repo configuration. Before pushing:

```bash
git status --short --branch
npm test
```

Push to `origin master`.
