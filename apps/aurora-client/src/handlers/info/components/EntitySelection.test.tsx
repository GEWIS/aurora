import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConferenceRoomsResponse, NewsHeadline } from '@gewis/aurora-api-client';
import { sList } from '../settings';
import ConferenceRoomsWidget from './ConferenceRoomsWidget';
import NewsTicker from './NewsTicker';

const rooms: ConferenceRoomsResponse = {
  summary: 'Two rooms available',
  rooms: [
    { id: 1, number: 'Room A', available: true, busy: [] },
    { id: 2, number: 'Room B', available: true, busy: [] },
  ],
};

const headlines: NewsHeadline[] = [
  { title: 'Alpha headline', source: 'BBC', sourceId: 1 },
  { title: 'Beta headline', source: 'NOS', sourceId: 2 },
];

describe('sList', () => {
  it('reads a string list, ignoring non-list/non-string values', () => {
    expect(sList({ x: ['1', '2'] }, 'x')).toEqual(['1', '2']);
    expect(sList({ x: 'nope' }, 'x')).toEqual([]);
    expect(sList(undefined, 'x')).toEqual([]);
  });
});

describe('ConferenceRoomsWidget room selection', () => {
  it('shows all rooms when no selection is set', () => {
    render(<ConferenceRoomsWidget rooms={rooms} settings={{}} />);
    expect(screen.getByText('Room A')).toBeInTheDocument();
    expect(screen.getByText('Room B')).toBeInTheDocument();
  });

  it('shows only the selected rooms', () => {
    render(<ConferenceRoomsWidget rooms={rooms} settings={{ rooms: ['1'] }} />);
    expect(screen.getByText('Room A')).toBeInTheDocument();
    expect(screen.queryByText('Room B')).not.toBeInTheDocument();
  });
});

describe('NewsTicker source selection', () => {
  it('shows all sources when no selection is set', () => {
    render(<NewsTicker headlines={headlines} settings={{}} />);
    // The track is duplicated for a seamless marquee, so match with getAllByText.
    expect(screen.getAllByText('Alpha headline').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Beta headline').length).toBeGreaterThan(0);
  });

  it('shows only headlines from the selected sources', () => {
    render(<NewsTicker headlines={headlines} settings={{ sources: ['1'] }} />);
    expect(screen.getAllByText('Alpha headline').length).toBeGreaterThan(0);
    expect(screen.queryByText('Beta headline')).not.toBeInTheDocument();
  });
});
