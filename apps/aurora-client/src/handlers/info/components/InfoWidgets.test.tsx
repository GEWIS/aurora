import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServiceState } from '@gewis/aurora-api-client';
import type {
  ConferenceRoomsResponse,
  ServicesHealthResponse,
  WeatherResponse,
} from '@gewis/aurora-api-client';
import ServicesWidget from './ServicesWidget';
import ConferenceRoomsWidget from './ConferenceRoomsWidget';
import WeatherForecastWidget from './WeatherForecastWidget';

const services: ServicesHealthResponse = {
  summary: 'Most services are operational',
  groups: [
    {
      name: 'General',
      state: ServiceState.DOWN,
      services: [{ name: 'Wiki', host: 'wiki.gewis.nl', state: ServiceState.DOWN }],
    },
    {
      name: 'Auth',
      state: ServiceState.UP,
      services: [{ name: 'Auth', host: 'auth.gewis.nl', state: ServiceState.UP }],
    },
    {
      name: 'Active member',
      state: ServiceState.MAINTENANCE,
      services: [{ name: 'Planka', host: 'planka.gewis.nl', state: ServiceState.MAINTENANCE }],
    },
  ],
};

const rooms: ConferenceRoomsResponse = {
  summary: 'Two rooms available',
  rooms: [
    { id: 1, number: 'MF 3.141', available: true, busy: [] },
    { id: 2, number: 'MF 3.144', available: false, busy: [] },
  ],
};

describe('ServicesWidget', () => {
  it('renders the summary and unfolds every group by default', () => {
    render(<ServicesWidget services={services} />);
    expect(screen.getByText('Most services are operational')).toBeInTheDocument();
    expect(screen.getByText('wiki.gewis.nl')).toBeInTheDocument();
    expect(screen.getByText('planka.gewis.nl')).toBeInTheDocument();
    expect(screen.getByText('auth.gewis.nl')).toBeInTheDocument();
  });

  it('unfolds only the groups that are not up when onlyOffline is set', () => {
    render(<ServicesWidget services={services} settings={{ onlyOffline: true }} />);
    // Every group is still listed…
    expect(screen.getByText('Auth')).toBeInTheDocument();
    // …but only the down and maintenance ones list their services.
    expect(screen.getByText('wiki.gewis.nl')).toBeInTheDocument();
    expect(screen.getByText('planka.gewis.nl')).toBeInTheDocument();
    expect(screen.queryByText('auth.gewis.nl')).not.toBeInTheDocument();
  });

  it("colours each dot with Uptime Kuma's status colour", () => {
    const { container } = render(<ServicesWidget services={services} />);
    const colors = [...container.querySelectorAll<HTMLElement>('.rounded-full')].map(
      (el) => el.style.backgroundColor,
    );
    // Group dot then its service dot, per group: down, down, up, maintenance, …
    expect(colors).toContain('rgb(220, 38, 38)'); // down  #dc2626
    expect(colors).toContain('rgb(92, 221, 139)'); // up    #5cdd8b
    expect(colors).toContain('rgb(23, 71, 245)'); // maintenance #1747f5
  });

  it('shows a fallback when no data', () => {
    render(<ServicesWidget services={null} />);
    expect(screen.getByText('Services unavailable')).toBeInTheDocument();
  });

  it('does not paint the broadcast while it is fetching its own status page', () => {
    // A widget pointed at another status page must not flash the
    // deployment-wide health first: those are different services under a
    // heading that claims otherwise.
    render(
      <ServicesWidget services={services} settings={{ statusPageUrl: 'https://s.example' }} />,
    );
    expect(screen.getByText('Services unavailable')).toBeInTheDocument();
    expect(screen.queryByText('Most services are operational')).not.toBeInTheDocument();
  });

  it('still follows the broadcast when no status page is configured', () => {
    render(<ServicesWidget services={services} settings={{ statusPageUrl: '' }} />);
    expect(screen.getByText('Most services are operational')).toBeInTheDocument();
  });
});

describe('ConferenceRoomsWidget', () => {
  it('renders the summary and room numbers (summary mode)', () => {
    render(<ConferenceRoomsWidget rooms={rooms} />);
    expect(screen.getByText('Two rooms available')).toBeInTheDocument();
    expect(screen.getByText('MF 3.141')).toBeInTheDocument();
    expect(screen.getByText('MF 3.144')).toBeInTheDocument();
  });

  it('renders the timeline view with room numbers in timeline mode', () => {
    render(<ConferenceRoomsWidget rooms={rooms} settings={{ mode: 'timeline' }} />);
    expect(screen.getByText('Two rooms available')).toBeInTheDocument();
    expect(screen.getByText('MF 3.141')).toBeInTheDocument();
    expect(screen.getByText('MF 3.144')).toBeInTheDocument();
  });
});

describe('WeatherForecastWidget', () => {
  it('status mode shows the current temperature (and details)', () => {
    const weather = { temperature: 21, windBft: 3, description: 'Zonnig' } as WeatherResponse;
    render(<WeatherForecastWidget weather={weather} radar={null} settings={{ mode: 'summary' }} />);
    expect(screen.getByText('21°')).toBeInTheDocument();
    expect(screen.getByText(/3 Bft/)).toBeInTheDocument();
  });

  it('status mode shows a fallback with no weather', () => {
    render(<WeatherForecastWidget weather={null} radar={null} settings={{ mode: 'summary' }} />);
    expect(screen.getByText('Weather unavailable')).toBeInTheDocument();
  });

  it('timeline mode shows only the chart (no temperature)', () => {
    const weather = { temperature: 21, description: 'Zonnig' } as WeatherResponse;
    const { container } = render(
      <WeatherForecastWidget weather={weather} radar={null} settings={{ mode: 'timeline' }} />,
    );
    expect(container.querySelector('svg')).not.toBeNull();
    expect(screen.queryByText('21°')).not.toBeInTheDocument();
  });
});
