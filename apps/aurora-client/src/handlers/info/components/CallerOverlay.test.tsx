import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createElement, HTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';
import { act, render, screen } from '@testing-library/react';
import CallerOverlay, { CallerEvent } from './CallerOverlay';

// Render framer-motion elements plainly so overlay visibility is deterministic.
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: {
    div: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) =>
      createElement('div', props, children),
    img: (props: ImgHTMLAttributes<HTMLImageElement>) => createElement('img', props),
  },
}));

const known: CallerEvent = {
  ringing: true,
  known: true,
  name: 'GEWIS',
  photoUrl: 'https://example/gewis.png',
};
const unknown: CallerEvent = { ringing: true, known: false, name: null, photoUrl: null };
/** Not in the directory, but the phone system told us who is calling. */
const reported: CallerEvent = {
  ringing: true,
  known: false,
  name: '+31612345678',
  photoUrl: null,
};

describe('CallerOverlay', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows "<name> calling" with a photo for a known caller', () => {
    render(<CallerOverlay event={known} />);
    expect(screen.getByText('GEWIS calling')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', known.photoUrl);
  });

  it('shows the generic ringing message for an unknown caller', () => {
    render(<CallerOverlay event={unknown} />);
    expect(screen.getByText('Phone is ringing')).toBeInTheDocument();
  });

  it('auto-dismisses after 20 seconds', () => {
    render(<CallerOverlay event={known} />);
    expect(screen.getByText('GEWIS calling')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    expect(screen.queryByText('GEWIS calling')).not.toBeInTheDocument();
  });

  it('names a caller the phone system reported, without a photo', () => {
    render(<CallerOverlay event={reported} />);
    expect(screen.getByText('+31612345678 calling')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders nothing when not ringing', () => {
    render(<CallerOverlay event={{ ringing: false, known: false, name: null, photoUrl: null }} />);
    expect(screen.queryByText(/calling|ringing/i)).not.toBeInTheDocument();
  });

  it('dismisses before the timeout when the call stops ringing', () => {
    const { rerender } = render(<CallerOverlay event={known} />);
    expect(screen.getByText('GEWIS calling')).toBeInTheDocument();

    // The phone system reported the hang-up (answered, declined or cancelled).
    rerender(
      <CallerOverlay event={{ ringing: false, known: false, name: null, photoUrl: null }} />,
    );

    expect(screen.queryByText('GEWIS calling')).not.toBeInTheDocument();
  });
});
