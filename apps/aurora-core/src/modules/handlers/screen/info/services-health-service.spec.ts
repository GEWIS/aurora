import { describe, it, expect } from 'vitest';
import ServicesHealthService, {
  DEFAULT_STATUS_PAGE_URL,
  GatusEndpoint,
  KumaHeartbeats,
  KumaStatusPage,
  ServiceGroup,
  ServiceState,
} from './services-health-service';

const page: KumaStatusPage = {
  publicGroupList: [
    {
      name: 'General',
      monitorList: [
        { id: 1, name: 'Wiki', url: 'https://wiki.gewis.nl/' },
        { id: 2, name: 'Mail', url: 'https://mail.gewis.nl' },
      ],
    },
    {
      name: 'Active member',
      monitorList: [{ id: 3, name: 'Planka', url: 'https://planka.gewis.nl' }],
    },
  ],
};

/** Kuma sends heartbeats oldest first, so only the last one counts. */
const beats = (statuses: Record<number, number[]>): KumaHeartbeats => ({
  heartbeatList: Object.fromEntries(
    Object.entries(statuses).map(([id, list]) => [id, list.map((status) => ({ status }))]),
  ),
});

describe('ServicesHealthService.transformKuma', () => {
  it('maps status page groups and monitors onto the widget shape', () => {
    const res = ServicesHealthService.transformKuma(page, beats({ 1: [1], 2: [1], 3: [1] }));

    expect(res.groups.map((g) => g.name)).toEqual(['General', 'Active member']);
    expect(res.groups[0].services).toEqual([
      { name: 'Wiki', host: 'wiki.gewis.nl', state: 'up' },
      { name: 'Mail', host: 'mail.gewis.nl', state: 'up' },
    ]);
    expect(res.summary).toBe('All services are operational');
  });

  it('takes the most recent heartbeat, not the first', () => {
    const res = ServicesHealthService.transformKuma(
      page,
      beats({ 1: [1, 1, 0], 2: [0, 1], 3: [1] }),
    );
    const general = res.groups[0];
    expect(general.services.map((s) => s.state)).toEqual(['down', 'up']);
  });

  it('maps every Kuma status code to its own state', () => {
    const res = ServicesHealthService.transformKuma(
      {
        publicGroupList: [
          {
            name: 'All',
            monitorList: [
              { id: 0, name: 'down' },
              { id: 1, name: 'up' },
              { id: 2, name: 'pending' },
              { id: 3, name: 'maintenance' },
            ],
          },
        ],
      },
      beats({ 0: [0], 1: [1], 2: [2], 3: [3] }),
    );
    expect(res.groups[0].services.map((s) => s.state)).toEqual([
      'down',
      'up',
      'pending',
      'maintenance',
    ]);
  });

  it('gives a group the worst state it contains', () => {
    const down = ServicesHealthService.transformKuma(page, beats({ 1: [0], 2: [2], 3: [1] }));
    expect(down.groups[0].state).toBe('down');
    expect(down.groups[1].state).toBe('up');

    const pending = ServicesHealthService.transformKuma(page, beats({ 1: [3], 2: [2], 3: [1] }));
    expect(pending.groups[0].state).toBe('pending');

    const maintenance = ServicesHealthService.transformKuma(
      page,
      beats({ 1: [3], 2: [1], 3: [1] }),
    );
    expect(maintenance.groups[0].state).toBe('maintenance');
  });

  it('treats a monitor without heartbeats as unknown, not down', () => {
    const res = ServicesHealthService.transformKuma(page, beats({ 2: [1], 3: [1] }));
    expect(res.groups[0].services[0].state).toBe('unknown');
    expect(res.groups[0].state).toBe('unknown');
  });

  it('falls back to the monitor name when it has no URL', () => {
    const res = ServicesHealthService.transformKuma(
      { publicGroupList: [{ name: 'Infra', monitorList: [{ id: 9, name: 'GEWIS vdesktop' }] }] },
      beats({ 9: [1] }),
    );
    expect(res.groups[0].services[0].host).toBe('GEWIS vdesktop');
  });

  it('keeps a bare host from a non-HTTP monitor as-is', () => {
    const res = ServicesHealthService.transformKuma(
      {
        publicGroupList: [
          { name: 'Infra', monitorList: [{ id: 9, name: 'DNS', url: 'ns1.gewis.nl' }] },
        ],
      },
      beats({ 9: [1] }),
    );
    expect(res.groups[0].services[0].host).toBe('ns1.gewis.nl');
  });

  it('summarises an all-down, a maintenance and an empty status page', () => {
    const allDown = ServicesHealthService.transformKuma(page, beats({ 1: [0], 2: [0], 3: [0] }));
    expect(allDown.summary).toBe('All services are offline');

    const maintenance = ServicesHealthService.transformKuma(
      page,
      beats({ 1: [3], 2: [1], 3: [1] }),
    );
    expect(maintenance.summary).toBe('Wiki is under maintenance');

    expect(ServicesHealthService.transformKuma({}, {}).summary).toBe(
      'No services are being monitored',
    );
  });

  it('names the down services in the summary, across groups', () => {
    const res = ServicesHealthService.transformKuma(page, beats({ 1: [0], 2: [1], 3: [0] }));
    expect(res.summary).toBe('Wiki and Planka are down');
  });
});

describe('ServicesHealthService.summarize', () => {
  const group = (...services: [string, ServiceState][]): ServiceGroup[] => [
    {
      name: 'General',
      state: ServicesHealthService.worstState(services.map(([, s]) => s)),
      services: services.map(([name, state]) => ({ name, host: name, state })),
    },
  ];

  it('names a single down service', () => {
    expect(ServicesHealthService.summarize(group(['Wiki', 'down'], ['Mail', 'up']))).toBe(
      'Wiki is down',
    );
  });

  it('joins two names with "and"', () => {
    expect(
      ServicesHealthService.summarize(group(['Wiki', 'down'], ['Mail', 'down'], ['Vault', 'up'])),
    ).toBe('Wiki and Mail are down');
  });

  it('joins three names with commas and "and"', () => {
    expect(
      ServicesHealthService.summarize(
        group(['Wiki', 'down'], ['Mail', 'down'], ['Vault', 'down'], ['Auth', 'up']),
      ),
    ).toBe('Wiki, Mail and Vault are down');
  });

  it('counts the rest once there are more names than it spells out', () => {
    expect(
      ServicesHealthService.summarize(
        group(
          ['Wiki', 'down'],
          ['Mail', 'down'],
          ['Vault', 'down'],
          ['Auth', 'down'],
          ['Planka', 'up'],
        ),
      ),
    ).toBe('Wiki, Mail, Vault and 1 other are down');

    expect(
      ServicesHealthService.summarize(
        group(
          ['Wiki', 'down'],
          ['Mail', 'down'],
          ['Vault', 'down'],
          ['Auth', 'down'],
          ['Planka', 'down'],
          ['LaTeX', 'up'],
        ),
      ),
    ).toBe('Wiki, Mail, Vault and 2 others are down');
  });

  it('prefers the outage over a concurrent maintenance', () => {
    expect(ServicesHealthService.summarize(group(['Wiki', 'down'], ['Mail', 'maintenance']))).toBe(
      'Wiki is down',
    );
  });

  it('falls back to a generic line for pending/unknown only', () => {
    expect(ServicesHealthService.summarize(group(['Wiki', 'pending'], ['Mail', 'up']))).toBe(
      'Most services are operational',
    );
    expect(ServicesHealthService.summarize(group(['Wiki', 'unknown'], ['Mail', 'up']))).toBe(
      'Most services are operational',
    );
    expect(ServicesHealthService.summarize(group(['Wiki', 'up'], ['Mail', 'up']))).toBe(
      'All services are operational',
    );
  });
});

describe('ServicesHealthService.worstState', () => {
  it('ranks down over pending over maintenance over unknown over up', () => {
    expect(ServicesHealthService.worstState(['up', 'maintenance', 'down', 'pending'])).toBe('down');
    expect(ServicesHealthService.worstState(['up', 'maintenance', 'pending'])).toBe('pending');
    expect(ServicesHealthService.worstState(['up', 'maintenance', 'unknown'])).toBe('maintenance');
    expect(ServicesHealthService.worstState(['up', 'unknown'])).toBe('unknown');
    expect(ServicesHealthService.worstState(['up', 'up'])).toBe('up');
  });

  it('calls an empty group up', () => {
    expect(ServicesHealthService.worstState([])).toBe('up');
  });
});

describe('ServicesHealthService.transformGatus', () => {
  const endpoints: GatusEndpoint[] = [
    { name: 'wiki', group: 'General', results: [{ success: true, hostname: 'wiki.gewis.nl' }] },
    { name: 'mail', group: 'General', results: [{ success: true }, { success: false }] },
    { name: 'planka', group: 'Active member', results: [{ success: true }] },
  ];

  it('groups endpoints by their group, keeping the API order', () => {
    const res = ServicesHealthService.transformGatus(endpoints);
    expect(res.groups.map((g) => g.name)).toEqual(['General', 'Active member']);
    expect(res.groups[0].services.map((s) => s.name)).toEqual(['wiki', 'mail']);
  });

  it('takes the most recent result and maps success onto up/down', () => {
    const res = ServicesHealthService.transformGatus(endpoints);
    expect(res.groups[0].services.map((s) => s.state)).toEqual(['up', 'down']);
    expect(res.groups[0].state).toBe('down');
    expect(res.groups[1].state).toBe('up');
    expect(res.summary).toBe('mail is down');
  });

  it('uses the result hostname, falling back to the endpoint name', () => {
    const res = ServicesHealthService.transformGatus(endpoints);
    expect(res.groups[0].services.map((s) => s.host)).toEqual(['wiki.gewis.nl', 'mail']);
  });

  it('treats an endpoint with no results as unknown', () => {
    const res = ServicesHealthService.transformGatus([{ name: 'fresh', group: 'General' }]);
    expect(res.groups[0].services[0].state).toBe('unknown');
  });

  it('collects endpoints without a group under "Ungrouped"', () => {
    const res = ServicesHealthService.transformGatus([
      { name: 'a', results: [{ success: true }] },
      { name: 'b', group: '  ', results: [{ success: true }] },
    ]);
    expect(res.groups.map((g) => g.name)).toEqual(['Ungrouped']);
    expect(res.groups[0].services).toHaveLength(2);
  });

  it('summarises an empty Gatus instance', () => {
    expect(ServicesHealthService.transformGatus([]).summary).toBe(
      'No services are being monitored',
    );
  });
});

describe('provider detection', () => {
  it('recognises an Uptime Kuma payload but not a Gatus one', () => {
    expect(ServicesHealthService.looksLikeKuma({ publicGroupList: [] })).toBe(true);
    expect(ServicesHealthService.looksLikeKuma([])).toBe(false);
    expect(ServicesHealthService.looksLikeKuma({ endpoints: [] })).toBe(false);
    expect(ServicesHealthService.looksLikeKuma(null)).toBe(false);
  });

  it('recognises a Gatus payload but not a Kuma one', () => {
    expect(ServicesHealthService.looksLikeGatus([{ name: 'wiki', results: [] }])).toBe(true);
    // An instance with nothing configured still answers with an array.
    expect(ServicesHealthService.looksLikeGatus([])).toBe(true);
    expect(ServicesHealthService.looksLikeGatus({ publicGroupList: [] })).toBe(false);
    expect(ServicesHealthService.looksLikeGatus([{ foo: 1 }])).toBe(false);
  });

  it('takes a .../status/<slug> URL as Uptime Kuma without probing', async () => {
    ServicesHealthService.clearProviderCache();
    await expect(
      ServicesHealthService.resolve('https://status.gewis.nl/status/gewis'),
    ).resolves.toEqual({
      provider: 'uptime-kuma',
      base: 'https://status.gewis.nl',
      slug: 'gewis',
    });
  });
});

describe('ServicesHealthService.parseUrl', () => {
  it('splits a Kuma status page URL into origin and slug', () => {
    expect(ServicesHealthService.parseUrl('https://status.gewis.nl/status/gewis')).toEqual({
      base: 'https://status.gewis.nl',
      slug: 'gewis',
      isKumaStatusPage: true,
    });
  });

  it('keeps a sub-path on which Kuma is hosted', () => {
    expect(ServicesHealthService.parseUrl('https://gewis.nl/kuma/status/gewis')).toEqual({
      base: 'https://gewis.nl/kuma',
      slug: 'gewis',
      isKumaStatusPage: true,
    });
  });

  it('leaves a bare origin for probing to identify', () => {
    expect(ServicesHealthService.parseUrl('https://status.gewis.nl/')).toEqual({
      base: 'https://status.gewis.nl',
      slug: 'default',
      isKumaStatusPage: false,
    });
  });

  it('treats any other path as the base a status API is hosted under', () => {
    expect(ServicesHealthService.parseUrl('https://gewis.nl/gatus')).toEqual({
      base: 'https://gewis.nl/gatus',
      slug: 'default',
      isKumaStatusPage: false,
    });
  });

  it('rejects a non-URL and a status page URL with no slug', () => {
    expect(() => ServicesHealthService.parseUrl('not a url')).toThrow(/not a valid URL/);
    expect(() => ServicesHealthService.parseUrl('https://status.gewis.nl/status')).toThrow(/slug/);
  });
});

describe('DEFAULT_STATUS_PAGE_URL', () => {
  it('is the GEWIS Uptime Kuma instance', () => {
    expect(DEFAULT_STATUS_PAGE_URL).toBe('https://uptime.gewis.nl');
    expect(ServicesHealthService.parseUrl(DEFAULT_STATUS_PAGE_URL)).toEqual({
      base: 'https://uptime.gewis.nl',
      slug: 'default',
      isKumaStatusPage: false,
    });
  });
});
