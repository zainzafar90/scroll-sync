import type {
  PopupMessage,
  ContentMessage,
  TabInfo,
  ExtensionState,
  ScrollDirection,
  ScrollStatus,
} from '~/utils/messaging';

const RESTRICTED_URL_PREFIXES = [
  'chrome://',
  'chrome-extension://',
  'about:',
  'edge://',
  'brave://',
  'devtools://',
  'view-source:',
  'chrome-search://',
];

function isInjectableUrl(url: string | undefined): boolean {
  if (!url) return false;
  return !RESTRICTED_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

export default defineBackground(() => {
  const state = {
    tabA: null as number | null,
    tabB: null as number | null,
    speed: 1,
    interval: 16,
    status: 'idle' as ScrollStatus,
    direction: 'down' as ScrollDirection,
    timerId: null as ReturnType<typeof setTimeout> | null,
  };

  async function ensureContentScript(tabId: number): Promise<void> {
    try {
      await browser.tabs.sendMessage(tabId, { type: 'PING' } satisfies ContentMessage);
    } catch {
      await browser.scripting.executeScript({
        target: { tabId },
        files: ['content-scripts/content.js'],
      });
    }
  }

  async function ensureBothScripts(): Promise<void> {
    const ids = [state.tabA, state.tabB].filter((id): id is number => id != null);
    await Promise.all(ids.map(ensureContentScript));
  }

  async function sendToBothTabs(msg: ContentMessage): Promise<void> {
    const ids = [state.tabA, state.tabB].filter((id): id is number => id != null);
    await Promise.all(ids.map((id) => browser.tabs.sendMessage(id, msg)));
  }

  async function scrollBoth(): Promise<void> {
    if (state.status !== 'running' || !state.tabA || !state.tabB) return;

    const msg: ContentMessage = {
      type: 'SCROLL',
      delta: state.direction === 'down' ? state.speed : -state.speed,
    };

    try {
      const [resA, resB] = await Promise.all([
        browser.tabs.sendMessage(state.tabA, msg) as Promise<{ ok: boolean; atEnd?: boolean }>,
        browser.tabs.sendMessage(state.tabB, msg) as Promise<{ ok: boolean; atEnd?: boolean }>,
      ]);
      if (resA.atEnd && resB.atEnd) {
        stopTimer();
        state.status = 'idle';
      }
    } catch (err) {
      console.warn('Scroll failed, stopping:', err);
      stopTimer();
      state.status = 'idle';
    }
  }

  function scheduleScroll(): void {
    state.timerId = setTimeout(async () => {
      if (state.status !== 'running') return;
      await scrollBoth();
      if (state.status === 'running') scheduleScroll();
    }, state.interval);
  }

  function startScrolling(): void {
    stopTimer();
    state.status = 'running';
    scheduleScroll();
  }

  function stopTimer(): void {
    if (state.timerId) {
      clearTimeout(state.timerId);
      state.timerId = null;
    }
  }

  browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    const message = msg as PopupMessage;
    (async () => {
      switch (message.type) {
        case 'GET_STATE': {
          const [tabs, currentWindow] = await Promise.all([
            browser.tabs.query({}),
            browser.windows.getCurrent(),
          ]);
          const tabList: TabInfo[] = tabs
            .filter((t) => isInjectableUrl(t.url))
            .map((t) => ({
              id: t.id!,
              title: t.title || '',
              url: t.url || '',
              favIconUrl: t.favIconUrl || '',
              windowId: t.windowId!,
            }));
          sendResponse({
            tabA: state.tabA,
            tabB: state.tabB,
            speed: state.speed,
            status: state.status,
            direction: state.direction,
            tabs: tabList,
            currentWindowId: currentWindow.id!,
          } satisfies ExtensionState);
          break;
        }

        case 'SET_TABS': {
          if (state.status === 'running') stopTimer();
          state.tabA = message.tabA;
          state.tabB = message.tabB;
          state.status = 'idle';
          try {
            await ensureBothScripts();
            sendResponse({ ok: true });
          } catch {
            state.tabA = null;
            state.tabB = null;
            sendResponse({ ok: false, error: 'Cannot inject into that tab. It may be a restricted page.' });
          }
          break;
        }

        case 'SET_SPEED': {
          state.speed = message.speed;
          sendResponse({ ok: true });
          break;
        }

        case 'SET_DIRECTION': {
          state.direction = message.direction;
          sendResponse({ ok: true });
          break;
        }

        case 'START': {
          if (!state.tabA || !state.tabB) {
            sendResponse({ ok: false, error: 'Select two tabs first.' });
            break;
          }
          try {
            await ensureBothScripts();
            startScrolling();
            sendResponse({ ok: true });
          } catch {
            sendResponse({ ok: false, error: 'Failed to connect to tabs. Try re-selecting them.' });
          }
          break;
        }

        case 'STOP': {
          stopTimer();
          state.status = 'paused';
          sendResponse({ ok: true });
          break;
        }

        case 'SCROLL_TO_TOP': {
          try {
            await sendToBothTabs({ type: 'SCROLL_TO', y: 0 });
            sendResponse({ ok: true });
          } catch {
            sendResponse({ ok: false, error: 'Could not scroll tabs to top.' });
          }
          break;
        }

        default:
          sendResponse({ ok: false, error: 'Unknown message type' });
      }
    })();
    return true;
  });

  browser.tabs.onRemoved.addListener((tabId) => {
    if (tabId === state.tabA || tabId === state.tabB) {
      stopTimer();
      state.status = 'idle';
      if (tabId === state.tabA) state.tabA = null;
      if (tabId === state.tabB) state.tabB = null;
    }
  });
});
