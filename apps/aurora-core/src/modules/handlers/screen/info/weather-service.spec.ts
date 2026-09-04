import { describe, it, expect } from 'vitest';
import WeatherService from './weather-service';

const stations = [
  { stationname: 'Amsterdam', lat: 52.3, lon: 4.9, temperature: 18 },
  {
    stationname: 'Eindhoven',
    lat: 51.45,
    lon: 5.42,
    temperature: 21,
    windspeedBft: 3,
    humidity: 60,
  },
];

describe('WeatherService.parseNearest', () => {
  it('selects the station nearest to the coordinates', () => {
    const result = WeatherService.parseNearest(stations, 51.447, 5.487);
    expect(result.station).toBe('Eindhoven');
    expect(result.temperature).toBe(21);
    expect(result.windBft).toBe(3);
    expect(result.humidity).toBe(60);
    expect(result.pressure).toBeNull();
  });

  it('picks a different station for far-away coordinates', () => {
    const result = WeatherService.parseNearest(stations, 52.37, 4.9);
    expect(result.station).toBe('Amsterdam');
  });

  it('returns nulls when there are no stations', () => {
    const result = WeatherService.parseNearest([], 51.447, 5.487);
    expect(result.temperature).toBeNull();
  });
});
