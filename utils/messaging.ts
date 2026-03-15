export type ScrollDirection = 'up' | 'down';
export type ScrollStatus = 'idle' | 'running' | 'paused';

export interface TabInfo {
  id: number;
  title: string;
  url: string;
  favIconUrl: string;
  windowId: number;
}

export interface ExtensionState {
  tabA: number | null;
  tabB: number | null;
  speed: number;
  status: ScrollStatus;
  direction: ScrollDirection;
  tabs: TabInfo[];
  currentWindowId: number;
}

export type PopupMessage =
  | { type: 'GET_STATE' }
  | { type: 'SET_TABS'; tabA: number | null; tabB: number | null }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'SET_DIRECTION'; direction: ScrollDirection }
  | { type: 'START' }
  | { type: 'STOP' }
  | { type: 'SCROLL_TO_TOP' };

export type ContentMessage =
  | { type: 'PING' }
  | { type: 'SCROLL'; delta: number }
  | { type: 'SCROLL_TO'; y: number };

export type ApiResponse = { ok: boolean; error?: string };

export function sendToBackground(msg: { type: 'GET_STATE' }): Promise<ExtensionState>;
export function sendToBackground(msg: PopupMessage): Promise<ApiResponse>;
export function sendToBackground(msg: PopupMessage): Promise<ExtensionState | ApiResponse> {
  return browser.runtime.sendMessage(msg);
}

export function sendToTab(tabId: number, msg: ContentMessage): Promise<ApiResponse> {
  return browser.tabs.sendMessage(tabId, msg);
}
