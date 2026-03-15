import { useState, useRef, useEffect, useMemo } from 'react';
import type { TabInfo } from '~/utils/messaging';

interface TabPickerProps {
  tabs: TabInfo[];
  currentWindowId: number;
  selectedId: number | null;
  onSelect: (tabId: number) => void;
}

function getTabLabel(tab: TabInfo): string {
  if (tab.title) return tab.title.substring(0, 50);
  try {
    return new URL(tab.url).hostname;
  } catch {
    return 'Untitled';
  }
}

function Favicon({ url }: { url: string }) {
  return (
    <div
      className="favicon"
      style={url ? { backgroundImage: `url('${url}')` } : undefined}
    />
  );
}

interface WindowGroup {
  windowId: number;
  label: string;
  tabs: TabInfo[];
}

export default function TabPicker({ tabs, currentWindowId, selectedId, onSelect }: TabPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedTab = tabs.find((t) => t.id === selectedId);

  const windowGroups = useMemo((): WindowGroup[] => {
    const groups = new Map<number, TabInfo[]>();
    for (const tab of tabs) {
      if (!groups.has(tab.windowId)) groups.set(tab.windowId, []);
      groups.get(tab.windowId)!.push(tab);
    }

    const sortedIds = [...groups.keys()].sort((a, b) => {
      if (a === currentWindowId) return -1;
      if (b === currentWindowId) return 1;
      return a - b;
    });

    let otherIndex = 1;
    return sortedIds.map((windowId) => ({
      windowId,
      label: windowId === currentWindowId ? 'Current Window' : `Window ${otherIndex++}`,
      tabs: groups.get(windowId)!,
    }));
  }, [tabs, currentWindowId]);

  return (
    <div className="tab-picker" ref={containerRef}>
      <button
        className={`picker-trigger${isOpen ? ' open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        type="button"
      >
        {selectedTab && <Favicon url={selectedTab.favIconUrl} />}
        <span className={`trigger-text${!selectedTab ? ' placeholder' : ''}`}>
          {selectedTab ? getTabLabel(selectedTab) : 'Pick a tab...'}
        </span>
        <svg className="chevron" width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="picker-dropdown" role="listbox" aria-label="Select a tab">
          {windowGroups.map(({ windowId, label, tabs: windowTabs }) => (
            <div key={windowId}>
              <div className="window-group-label">{label}</div>
              {windowTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`tab-option${tab.id === selectedId ? ' selected' : ''}`}
                  role="option"
                  aria-selected={tab.id === selectedId}
                  onClick={() => {
                    onSelect(tab.id);
                    setIsOpen(false);
                  }}
                >
                  <Favicon url={tab.favIconUrl} />
                  <span className="tab-name">{getTabLabel(tab)}</span>
                  {tab.id === selectedId && <span className="check">✓</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
