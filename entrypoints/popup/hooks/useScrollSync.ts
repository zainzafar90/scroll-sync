import { useState, useEffect, useCallback } from 'react';
import type { ExtensionState, ScrollDirection, ScrollStatus, TabInfo } from '~/utils/messaging';
import { sendToBackground } from '~/utils/messaging';

export interface ScrollSyncState {
  tabs: TabInfo[];
  currentWindowId: number;
  selectedA: number | null;
  selectedB: number | null;
  speed: number;
  direction: ScrollDirection;
  status: ScrollStatus;
  error: string | null;
  hasPair: boolean;
}

export interface ScrollSyncActions {
  selectTab: (slot: 'A' | 'B', tabId: number | null) => void;
  changeSpeed: (speed: number) => void;
  changeDirection: (dir: ScrollDirection) => void;
  toggle: () => void;
  scrollToTop: () => void;
}

export function useScrollSync(): ScrollSyncState & ScrollSyncActions {
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [currentWindowId, setCurrentWindowId] = useState(0);
  const [selectedA, setSelectedA] = useState<number | null>(null);
  const [selectedB, setSelectedB] = useState<number | null>(null);
  const [speed, setSpeed] = useState(1);
  const [direction, setDirection] = useState<ScrollDirection>('down');
  const [status, setStatus] = useState<ScrollStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    sendToBackground({ type: 'GET_STATE' }).then((state) => {
      setTabs(state.tabs);
      setCurrentWindowId(state.currentWindowId);
      setSelectedA(state.tabA);
      setSelectedB(state.tabB);
      setSpeed(state.speed);
      setDirection(state.direction);
      setStatus(state.status);
    });
  }, []);

  const selectTab = useCallback(
    async (slot: 'A' | 'B', tabId: number | null) => {
      const newA = slot === 'A' ? tabId : selectedA;
      const newB = slot === 'B' ? tabId : selectedB;
      if (slot === 'A') setSelectedA(tabId);
      else setSelectedB(tabId);
      setStatus('idle');
      const res = await sendToBackground({ type: 'SET_TABS', tabA: newA, tabB: newB });
      if (!res.ok) setError(res.error || 'Failed');
      else setError(null);
    },
    [selectedA, selectedB],
  );

  const changeSpeed = useCallback(
    (value: number) => {
      if (value === speed) return;
      setSpeed(value);
      sendToBackground({ type: 'SET_SPEED', speed: value });
    },
    [speed],
  );

  const changeDirection = useCallback(
    (dir: ScrollDirection) => {
      if (dir === direction) return;
      setDirection(dir);
      sendToBackground({ type: 'SET_DIRECTION', direction: dir });
    },
    [direction],
  );

  const toggle = useCallback(async () => {
    if (status === 'running') {
      await sendToBackground({ type: 'STOP' });
      setStatus('paused');
      setError(null);
    } else {
      const res = await sendToBackground({ type: 'START' });
      if (res.ok) {
        setStatus('running');
        setError(null);
      } else {
        setError(res.error || 'Failed to start');
      }
    }
  }, [status]);

  const scrollToTop = useCallback(() => {
    sendToBackground({ type: 'SCROLL_TO_TOP' });
  }, []);

  const hasPair = selectedA != null && selectedB != null && selectedA !== selectedB;

  return {
    tabs, currentWindowId, selectedA, selectedB,
    speed, direction, status, error, hasPair,
    selectTab, changeSpeed, changeDirection, toggle, scrollToTop,
  };
}
