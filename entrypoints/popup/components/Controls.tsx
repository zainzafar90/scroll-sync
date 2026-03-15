import type { ScrollDirection } from '~/utils/messaging';

interface ControlsProps {
  speed: number;
  direction: ScrollDirection;
  onSpeedChange: (speed: number) => void;
  onDirectionChange: (dir: ScrollDirection) => void;
}

export default function Controls({ speed, direction, onSpeedChange, onDirectionChange }: ControlsProps) {
  return (
    <section className="section">
      <div className="controls-row">
        <div className="control-group" style={{ flex: 2 }}>
          <div className="label">Speed</div>
          <div className="speed-input">
            <input
              type="range"
              min={1}
              max={20}
              value={speed}
              onChange={(e) => onSpeedChange(+e.target.value)}
              aria-label="Scroll speed"
            />
            <span className="speed-val">{speed}×</span>
          </div>
        </div>
        <div className="control-group" style={{ flex: 1 }}>
          <div className="label">Direction</div>
          <div className="dir-toggle" role="radiogroup" aria-label="Scroll direction">
            <button
              className={`dir-btn${direction === 'down' ? ' active' : ''}`}
              onClick={() => onDirectionChange('down')}
              role="radio"
              aria-checked={direction === 'down'}
              aria-label="Scroll down"
              type="button"
            >
              ↓
            </button>
            <button
              className={`dir-btn${direction === 'up' ? ' active' : ''}`}
              onClick={() => onDirectionChange('up')}
              role="radio"
              aria-checked={direction === 'up'}
              aria-label="Scroll up"
              type="button"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
