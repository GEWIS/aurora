import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgendaEvent } from '@gewis/aurora-api-client';
import AgendaWidget, { eventStatus } from './AgendaWidget';

const at = (hh: number, mm = 0) => new Date(2026, 8, 17, hh, mm).toISOString();

const events: AgendaEvent[] = [
  { summary: 'Lunch lecture', start: at(12), end: at(13) },
  { summary: 'Board meeting', start: at(14), end: at(16) },
  { summary: 'Borrel', start: at(17), end: at(23) },
  { summary: 'Movie night', start: at(20), end: null },
];

describe('eventStatus', () => {
  const now = new Date(2026, 8, 17, 15);

  it('classifies events around now', () => {
    expect(eventStatus(events[0], now)).toBe('past');
    expect(eventStatus(events[1], now)).toBe('now');
    expect(eventStatus(events[2], now)).toBe('upcoming');
  });

  it('treats an event without an end as past once it has started', () => {
    const event = { summary: 'x', start: at(15), end: null };
    expect(eventStatus(event, new Date(2026, 8, 17, 14))).toBe('upcoming');
    expect(eventStatus(event, now)).toBe('past');
  });
});

describe('AgendaWidget', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 17, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const statusOf = (summary: string) =>
    screen.getByText(summary).closest('[data-status]')?.getAttribute('data-status');

  it('marks the current event and only the first upcoming event as next', () => {
    render(<AgendaWidget events={events} />);
    expect(statusOf('Lunch lecture')).toBe('past');
    expect(statusOf('Board meeting')).toBe('now');
    expect(statusOf('Borrel')).toBe('next');
    expect(statusOf('Movie night')).toBe('upcoming');
  });

  it('hides finished events when hidePast is set', () => {
    render(<AgendaWidget events={events} settings={{ hidePast: true }} />);
    expect(screen.queryByText('Lunch lecture')).not.toBeInTheDocument();
    expect(screen.getByText('Board meeting')).toBeInTheDocument();
  });
});
