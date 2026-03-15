import type { ContentMessage } from '~/utils/messaging';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',

  main() {
    browser.runtime.onMessage.addListener((raw, _sender, sendResponse) => {
      const msg = raw as ContentMessage;
      switch (msg.type) {
        case 'PING':
          sendResponse({ ok: true });
          break;
        case 'SCROLL': {
          const before = window.scrollY;
          window.scrollBy({ top: msg.delta, behavior: 'instant' });
          sendResponse({ ok: true, atEnd: window.scrollY === before });
          break;
        }
        case 'SCROLL_TO':
          window.scrollTo({ top: msg.y, behavior: 'smooth' });
          sendResponse({ ok: true });
          break;
        default:
          sendResponse({ ok: false });
      }
      return true;
    });
  },
});
