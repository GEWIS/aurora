import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createElement, HTMLAttributes } from 'react';
import { act, render, screen } from '@testing-library/react';
import type { ChildWidget } from '@gewis/aurora-api-client';
import CarouselWidget from './CarouselWidget';

// Render framer-motion elements plainly so only the current child is shown.
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: unknown }) => children,
  motion: {
    div: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) =>
      createElement('div', props, children),
  },
}));

const items: ChildWidget[] = [
  { instanceId: 'a', id: 'clock' },
  { instanceId: 'b', id: 'spotify' },
];

describe('CarouselWidget', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows the first child, then advances after the interval', () => {
    render(
      <CarouselWidget
        items={items}
        settings={{ interval: 5, animation: 'fade' }}
        renderChild={(c) => <span>{c.id}</span>}
      />,
    );
    expect(screen.getByText('clock')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('spotify')).toBeInTheDocument();
  });

  it('shows a placeholder when empty', () => {
    render(<CarouselWidget items={[]} renderChild={() => null} />);
    expect(screen.getByText('Empty carousel')).toBeInTheDocument();
  });
});
