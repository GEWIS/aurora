import { describe, it, expect } from 'vitest';
import { applyTreinLimbo } from './trains-transform';
import { TrainResponse } from '../poster/ns-trains-service';

function train(overrides: Partial<TrainResponse>): TrainResponse {
  return {
    direction: 'Utrecht Centraal',
    plannedDateTime: '2026-07-07T16:00:00+0200',
    delay: 0,
    trainType: 'IC',
    operator: 'NS',
    cancelled: false,
    routeStations: [],
    messages: [],
    ...overrides,
  };
}

describe('applyTreinLimbo', () => {
  it('rebrands Maastricht and Heerlen directions', () => {
    const result = applyTreinLimbo([
      train({ direction: 'Maastricht' }),
      train({ direction: 'Heerlen' }),
    ]);
    expect(result[0].direction).toBe('TreinLimbo Express Maastricht');
    expect(result[1].direction).toBe('TreinLimbo Express Heerlen');
  });

  it('rebrands matching route stations too', () => {
    const [result] = applyTreinLimbo([
      train({ direction: 'Maastricht', routeStations: ['Sittard', 'Heerlen'] }),
    ]);
    expect(result.routeStations).toEqual(['Sittard', 'TreinLimbo Express Heerlen']);
  });

  it('leaves other destinations untouched', () => {
    const [result] = applyTreinLimbo([train({ direction: 'Utrecht Centraal' })]);
    expect(result.direction).toBe('Utrecht Centraal');
  });
});
