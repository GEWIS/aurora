import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import InfoClock from './InfoClock';
import BeerPanel from './BeerPanel';

// Pin the clock to midday so beer-time assertions are deterministic regardless
// of when the suite runs: 00:00 is always in the past, 23:59 always in the future.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
});
afterEach(() => {
  vi.useRealTimers();
});

describe('InfoClock setting: mode', () => {
  it('renders an analog (SVG) face when mode is analog', () => {
    const { container } = render(<InfoClock settings={{ mode: 'analog' }} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});

describe('BeerPanel setting: altColor', () => {
  it('shows the beer-glass background once beer time has passed', () => {
    // 00:00 is always in the past today → "beer o'clock".
    render(<BeerPanel beerTime="00:00" lastCall={null} settings={{ altColor: true }} />);
    expect(screen.getByText("It's beer 'o clock")).toBeInTheDocument();
    expect(screen.getByTestId('beer-glass')).toBeInTheDocument();
  });

  it('has no beer-glass background when altColor is off', () => {
    render(<BeerPanel beerTime="00:00" lastCall={null} settings={{ altColor: false }} />);
    expect(screen.queryByTestId('beer-glass')).not.toBeInTheDocument();
  });

  it('has no beer-glass background before beer time', () => {
    render(<BeerPanel beerTime="23:59" lastCall={null} settings={{ altColor: true }} />);
    expect(screen.queryByTestId('beer-glass')).not.toBeInTheDocument();
  });
});

describe('BeerPanel setting: showLastCall', () => {
  it('shows the room last-call time at beer time when enabled', () => {
    render(<BeerPanel beerTime="00:00" lastCall="22:00" settings={{ showLastCall: true }} />);
    expect(screen.getByText('Last call at 22:00')).toBeInTheDocument();
  });

  it('hides the last-call line when the setting is off', () => {
    render(<BeerPanel beerTime="00:00" lastCall="22:00" settings={{ showLastCall: false }} />);
    expect(screen.queryByText(/Last call/)).not.toBeInTheDocument();
  });
});
