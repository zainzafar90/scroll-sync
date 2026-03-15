import type { ScrollStatus } from '~/utils/messaging';

interface StatusBarProps {
  status: ScrollStatus;
  error: string | null;
  hasPair: boolean;
}

const STATUS_CONFIG: Record<ScrollStatus, { dot: string; text: string }> = {
  running: { dot: 'dot live', text: 'Scrolling both tabs in sync' },
  paused: { dot: 'dot paused', text: 'Paused — click Resume to continue' },
  idle: { dot: 'dot', text: 'Select two tabs to begin' },
};

export default function StatusBar({ status, error, hasPair }: StatusBarProps) {
  if (error) {
    return (
      <div className="status-bar" role="status" aria-live="polite">
        <span className="dot error" />
        <span className="status-text error">{error}</span>
      </div>
    );
  }

  const config = STATUS_CONFIG[status];
  const text = status === 'idle' && hasPair ? 'Ready' : config.text;

  return (
    <div className="status-bar" role="status" aria-live="polite">
      <span className={config.dot} />
      <span className="status-text">{text}</span>
    </div>
  );
}
