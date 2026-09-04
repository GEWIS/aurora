import { describe, it, expect } from 'vitest';
import { placementStyle, renderWidget, SUPPORTED_WIDGET_IDS, WidgetData } from './WidgetRenderer';

const EMPTY: WidgetData = {
  weather: null,
  radar: null,
  trains: [],
  news: [],
  agenda: [],
  pcs: [],
  roomStatus: null,
  track: null,
  services: null,
  rooms: null,
  caller: null,
};

describe('placementStyle', () => {
  it('maps grid cells to 1-based CSS grid lines', () => {
    expect(placementStyle(0, 0, 4, 3)).toEqual({
      gridColumn: '1 / span 4',
      gridRow: '1 / span 3',
    });
    expect(placementStyle(6, 1, 2, 1)).toEqual({
      gridColumn: '7 / span 2',
      gridRow: '2 / span 1',
    });
  });
});

describe('SUPPORTED_WIDGET_IDS', () => {
  it('covers exactly the placeable widgets (no modal ids)', () => {
    expect([...SUPPORTED_WIDGET_IDS].sort()).toEqual(
      [
        'beer',
        'caller-inline',
        'carousel',
        'clock',
        'coffee',
        'conference-rooms',
        'events',
        'image',
        'logo',
        'news',
        'room-responsible',
        'services',
        'spotify',
        'status-stack',
        'text',
        'trains',
        'weather',
        'workstations',
      ].sort(),
    );
    expect(SUPPORTED_WIDGET_IDS).not.toContain('beer-modal');
    expect(SUPPORTED_WIDGET_IDS).not.toContain('caller');
  });
});

describe('renderWidget', () => {
  it('renders every supported widget id', () => {
    for (const id of SUPPORTED_WIDGET_IDS) {
      expect(renderWidget(id, EMPTY), `no component for ${id}`).not.toBeNull();
    }
  });

  it('returns null for an unknown id', () => {
    expect(renderWidget('nope', EMPTY)).toBeNull();
  });
});
