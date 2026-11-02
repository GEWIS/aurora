import { describe, it, expect } from 'vitest';
import NetbirdStatusService from './netbird-status-service';

const peer = (fqdn: string, status: string) => ({ fqdn, status });

describe('NetbirdStatusService.transform', () => {
  it('maps every NetBird status onto a widget state', () => {
    const res = NetbirdStatusService.transform({
      peers: {
        details: [
          peer('a.netbird.cloud', 'Connected'),
          peer('b.netbird.cloud', 'Connecting'),
          peer('c.netbird.cloud', 'Idle'),
          peer('d.netbird.cloud', 'SomethingNew'),
        ],
      },
    });

    expect(res.map((p) => p.state)).toEqual(['connected', 'connecting', 'offline', 'offline']);
  });

  it('keeps only the name, fqdn and state of a peer', () => {
    const output = {
      peers: {
        details: [
          {
            fqdn: 'pc-1.netbird.cloud',
            netbirdIp: '100.92.0.12',
            publicKey: 'c2VjcmV0',
            status: 'Connected',
            connectionType: 'P2P',
            iceCandidateEndpoint: '203.0.113.7:51820',
            relayAddress: 'rels://relay.netbird.io:443',
            latency: 1200000,
          },
        ],
      },
    };

    expect(NetbirdStatusService.transform(output)).toStrictEqual([
      { name: 'pc-1', fqdn: 'pc-1.netbird.cloud', state: 'connected' },
    ]);
  });

  it('returns no peers when the daemon lists none', () => {
    expect(NetbirdStatusService.transform({})).toEqual([]);
    expect(NetbirdStatusService.transform({ peers: {} })).toEqual([]);
  });
});
