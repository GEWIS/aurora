import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createElement, HTMLAttributes } from 'react';
import { act, render, screen } from '@testing-library/react';
import type { ChildWidget } from '@gewis/aurora-api-client';
import StatusStackWidget from './StatusStackWidget';
import { CallerEvent } from './CallerOverlay';

// EmitWrapper uses framer-motion; render its elements plainly.
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) =>
      createElement('div', props, children),
  },
}));

// Primary = the non-triggering child; the caller child triggers on a call.
const items: ChildWidget[] = [
  { instanceId: 'p', id: 'clock' },
  { instanceId: 'b', id: 'caller-inline' },
];

const ringing: CallerEvent = { ringing: true, known: false, name: null, photoUrl: null };

describe('StatusStackWidget', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows the primary, reveals the background on a call (global duration), then reverts', () => {
    const render1 = (caller: CallerEvent | null) => (
      <StatusStackWidget
        items={items}
        caller={caller}
        track={null}
        settings={{ duration: 10, emit: 'flash' }}
        renderChild={(c) => <span>{c.id}</span>}
      />
    );

    const { rerender } = render(render1(null));
    expect(screen.getByText('clock')).toBeInTheDocument();

    act(() => rerender(render1(ringing)));
    expect(screen.getByText('caller-inline')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByText('clock')).toBeInTheDocument();
  });
});
