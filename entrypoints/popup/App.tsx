import Logo from './components/Logo';
import TabPicker from './components/TabPicker';
import Controls from './components/Controls';
import StatusBar from './components/StatusBar';
import { useScrollSync } from './hooks/useScrollSync';

const BADGE_STYLES: Record<string, { className: string; text: string }> = {
  running: { className: 'badge scrolling', text: 'Scrolling' },
  paused: { className: 'badge paused', text: 'Paused' },
  idle: { className: 'badge idle', text: 'Idle' },
};

export default function App() {
  const {
    tabs, currentWindowId, selectedA, selectedB,
    speed, direction, status, error, hasPair,
    selectTab, changeSpeed, changeDirection, toggle, scrollToTop,
  } = useScrollSync();

  const badge = BADGE_STYLES[status];

  return (
    <>
      <header className="header">
        <Logo />
        <h1>ScrollSync</h1>
        <span className={badge.className}>{badge.text}</span>
      </header>

      <section className="section">
        <div className="label">Paired Tabs</div>
        <div className="tab-slot">
          <span className="slot-label slot-a">A</span>
          <TabPicker
            tabs={tabs}
            currentWindowId={currentWindowId}
            selectedId={selectedA}
            onSelect={(id) => selectTab('A', id)}
          />
        </div>
        <div className="tab-slot">
          <span className="slot-label slot-b">B</span>
          <TabPicker
            tabs={tabs}
            currentWindowId={currentWindowId}
            selectedId={selectedB}
            onSelect={(id) => selectTab('B', id)}
          />
        </div>
      </section>

      <Controls
        speed={speed}
        direction={direction}
        onSpeedChange={changeSpeed}
        onDirectionChange={changeDirection}
      />

      <section className="section">
        <div className="actions">
          <button
            className={`btn ${status === 'running' ? 'btn-pause' : 'btn-primary'}`}
            disabled={status === 'idle' && !hasPair}
            onClick={toggle}
          >
            {status === 'running' ? '⏸ Pause' : status === 'paused' ? '▶ Resume' : '▶ Start'}
          </button>
          <button
            className="btn btn-ghost"
            onClick={scrollToTop}
            aria-label="Scroll both to top"
          >
            ⤒
          </button>
        </div>
      </section>

      <StatusBar status={status} error={error} hasPair={hasPair} />
    </>
  );
}
