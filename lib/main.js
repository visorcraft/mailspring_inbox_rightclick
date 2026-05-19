'use strict';

const {
  AccountStore,
  Actions,
  CategoryStore,
  DatabaseStore,
  GetManyRFC2822Task,
  TaskFactory,
  Thread,
  localized,
} = require('mailspring-exports');

let contextMenuListener = null;

function normalize(value) {
  return `${value || ''}`.trim().toLowerCase();
}

function itemName(treeItem) {
  const container =
    treeItem &&
    Array.from(treeItem.children).find((child) => child.classList.contains('item-container'));
  const item =
    container && Array.from(container.children).find((child) => child.classList.contains('item'));
  const nameEl = item && item.querySelector('.name');
  return nameEl ? nameEl.getAttribute('title') || nameEl.textContent || '' : '';
}

function parentTreeItem(treeItem) {
  const group = treeItem && treeItem.parentElement;
  return group ? group.closest('[role="treeitem"]') : null;
}

function inboxCategoriesForSidebarItem(treeItem) {
  const name = itemName(treeItem);
  const parent = parentTreeItem(treeItem);
  const parentName = itemName(parent);
  const accounts = AccountStore.accounts();

  if (normalize(parentName) === 'inbox') {
    const account = accounts.find((acc) => normalize(acc.label) === normalize(name));
    const inbox = account && CategoryStore.getInboxCategory(account);
    return inbox ? [inbox] : [];
  }

  if (normalize(name) !== 'inbox') {
    return [];
  }

  return accounts
    .map((account) => CategoryStore.getInboxCategory(account))
    .filter(Boolean);
}

async function unreadThreadsForCategories(categories) {
  if (categories.length === 0) {
    return [];
  }

  const categoryIds = categories.map((category) => category.id);
  const query = DatabaseStore.findAll(Thread)
    .where([
      Thread.attributes.categories.containsAny(categoryIds),
      Thread.attributes.unread.equal(true),
      Thread.attributes.inAllMail.equal(true),
    ]);

  if (categoryIds.length > 1) {
    query.distinct();
  }

  return query;
}

async function markAllAsRead(categories) {
  const threads = await unreadThreadsForCategories(categories);
  if (threads.length === 0) {
    AppEnv.showErrorDialog({
      title: localized('No unread messages found'),
      message:
        'Mailspring did not find any unread threads in this inbox. If the badge remains, the local unread-count cache is stale.',
    });
    return;
  }

  const tasks = TaskFactory.tasksForThreadsByAccountId(threads, (accountThreads) =>
    TaskFactory.taskForSettingUnread({
      threads: accountThreads,
      unread: false,
      source: 'Sidebar Inbox Context Menu',
    })
  );

  Actions.queueTasks(tasks);
}

function exportFolder(category) {
  AppEnv.showOpenDialog(
    {
      title: localized('Export folder as .eml files'),
      buttonLabel: localized('Export'),
      properties: ['openDirectory', 'createDirectory'],
    },
    (selected) => {
      if (!selected || selected.length === 0) {
        return;
      }

      Actions.queueTask(
        new GetManyRFC2822Task({
          accountId: category.accountId,
          folderId: category.id,
          folderPath: category.path,
          outputDir: selected[0],
        })
      );
    }
  );
}

function buildMenu(categories) {
  const remote = require('@electron/remote');
  const { Menu, MenuItem } = remote;
  const menu = new Menu();

  menu.append(
    new MenuItem({
      label: localized('Mark All as Read'),
      click: () => markAllAsRead(categories).catch((err) => AppEnv.reportError(err)),
    })
  );

  if (categories.length === 1) {
    menu.append(
      new MenuItem({
        type: 'separator',
      })
    );
    menu.append(
      new MenuItem({
        label: localized('Export folder as .eml files...'),
        click: () => exportFolder(categories[0]),
      })
    );
  }

  return { menu, window: remote.getCurrentWindow() };
}

function onContextMenu(event) {
  try {
    const treeItem = event.target && event.target.closest('[role="treeitem"]');
    if (!treeItem) {
      return;
    }

    const categories = inboxCategoriesForSidebarItem(treeItem);
    if (categories.length === 0) {
      return;
    }

    const { menu, window } = buildMenu(categories);

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    setTimeout(() => {
      try {
        menu.popup({
          window,
          x: Math.round(event.clientX),
          y: Math.round(event.clientY),
        });
      } catch (err) {
        try {
          menu.popup({});
        } catch (fallbackErr) {
          AppEnv.reportError(fallbackErr);
        }
      }
    }, 0);
  } catch (err) {
    AppEnv.reportError(err);
  }
}

function activate() {
  contextMenuListener = onContextMenu;
  document.addEventListener('contextmenu', contextMenuListener, true);
}

function deactivate() {
  if (contextMenuListener) {
    document.removeEventListener('contextmenu', contextMenuListener, true);
  }
  contextMenuListener = null;
}

module.exports = { activate, deactivate };
