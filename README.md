# Inbox Mark All Read Context Menu

A small Mailspring plugin that adds `Mark All as Read` to the Inbox right-click menu in the account sidebar.

Mailspring has an `Edit > Mark All as Read` command, but in current builds it only acts on unread threads that are loaded in the visible thread list. This plugin queries every unread thread in the clicked inbox category and queues Mailspring's normal read-state sync tasks.

## What It Does

- Adds `Mark All as Read` when you right-click an `Inbox` sidebar item.
- Supports the unified `Inbox` item and per-account inbox items nested beneath it.
- Preserves Mailspring's existing `Export folder as .eml files...` action for single-account inboxes.
- Uses Mailspring's own `ChangeUnreadTask`, so read-state changes sync through Mailspring normally.

## Install

### From Mailspring

1. Download or clone this repository.
2. In Mailspring, open `Developer > Install a Plugin...`.
3. Choose this plugin folder.
4. Restart Mailspring.

### Manual Install

Copy this folder into Mailspring's `packages` directory, then restart Mailspring.

Common locations:

```text
Linux Flatpak:
~/.var/app/com.getmailspring.Mailspring/config/Mailspring/packages/inbox-mark-all-read-context-menu

Linux non-Flatpak:
~/.config/Mailspring/packages/inbox-mark-all-read-context-menu

macOS:
~/Library/Application Support/Mailspring/packages/inbox-mark-all-read-context-menu

Windows:
%APPDATA%\Mailspring\packages\inbox-mark-all-read-context-menu
```

## Development

This plugin has no npm dependencies.

```bash
npm test
```

## Notes

Mailspring does not currently expose a first-class plugin API for adding actions to existing sidebar context menus. This plugin uses a small DOM-level context-menu hook against the sidebar tree. It is intentionally narrow: it only intercepts recognized Inbox rows and leaves other sidebar right-click menus alone.

If Mailspring shows an unread count that does not correspond to any unread thread, that is a stale local cache/count issue rather than a context-menu issue. Use `Preferences > General > Local Data > Reset Cache` to rebuild Mailspring's local mail database without deleting accounts or settings.

Tested with Mailspring 1.21.0.
