import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { RoomStatusResponse } from '@gewis/aurora-api-client';
import RoomStatusWidget, { nextBeerTime } from './RoomStatusWidget';

const base: RoomStatusResponse = {
  open: true,
  responsible: [
    {
      name: 'Jan van den Jansen',
      isBoard: false,
      isCandidateBoard: false,
      isKeyholder: true,
      photoUrl: null,
    },
    {
      name: 'Pietersen',
      isBoard: true,
      isCandidateBoard: false,
      isKeyholder: false,
      photoUrl: null,
    },
  ],
  beerTime: null,
  lastCall: null,
  closedMessage: null,
  coffeeStatus: 0,
};

describe('RoomStatusWidget', () => {
  it('splits the responsible name into a big first name and small last name', () => {
    render(<RoomStatusWidget status={base} />);
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('van den Jansen')).toBeInTheDocument();
  });

  it('handles a single-word name (no last-name line)', () => {
    render(<RoomStatusWidget status={base} />);
    expect(screen.getByText('Pietersen')).toBeInTheDocument();
  });

  it('shows the closed message when the room is closed', () => {
    render(
      <RoomStatusWidget status={{ ...base, open: false, closedMessage: 'GEWIS is closed' }} />,
    );
    expect(screen.getByText('GEWIS is closed')).toBeInTheDocument();
  });
});

describe('nextBeerTime', () => {
  it('targets today when it is still afternoon', () => {
    const from = new Date('2026-07-08T15:00:00');
    const target = nextBeerTime('16:30', from)!;
    expect(target.getTime()).toBeGreaterThan(from.getTime());
    expect(target.getDate()).toBe(8);
  });

  it('keeps beer time in the past after midnight (does not restart the countdown)', () => {
    // 01:00 with an evening beer time ⇒ it belongs to the previous day (past).
    const from = new Date('2026-07-09T01:00:00');
    const target = nextBeerTime('16:30', from)!;
    expect(target.getTime()).toBeLessThan(from.getTime());
    expect(target.getDate()).toBe(8);
  });
});
