import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NetbirdPeerState, NetbirdPeerStatus } from '@gewis/aurora-api-client';
import NetbirdWidget from './NetbirdWidget';

const peer = (name: string, state: NetbirdPeerState): NetbirdPeerStatus => ({
  name,
  fqdn: `${name}.netbird.cloud`,
  state,
});

const peers: NetbirdPeerStatus[] = [
  peer('pc-1', NetbirdPeerState.CONNECTED),
  peer('pc', NetbirdPeerState.CONNECTING),
  peer('aurora', NetbirdPeerState.OFFLINE),
];

const names = () =>
  screen.getAllByText(/./, { selector: '[data-status] > span' }).map((e) => e.textContent);

const statusOf = (name: string) =>
  screen.getByText(name).closest('[data-status]')?.getAttribute('data-status');

describe('NetbirdWidget', () => {
  it('lists every peer by name when no peers are configured', () => {
    render(<NetbirdWidget peers={peers} />);
    expect(names()).toEqual(['aurora', 'pc', 'pc-1']);
    expect(statusOf('pc-1')).toBe('connected');
    expect(statusOf('pc')).toBe('connecting');
    expect(statusOf('aurora')).toBe('offline');
  });

  it('shows only the configured peers, in the configured order', () => {
    render(<NetbirdWidget peers={peers} settings={{ peers: ' PC-1.netbird.cloud , aurora' }} />);
    expect(names()).toEqual(['pc-1', 'aurora']);
    expect(statusOf('pc-1')).toBe('connected');
  });

  it('does not let a name match a longer peer name that starts with it', () => {
    render(
      <NetbirdWidget
        peers={[peer('pc-1', NetbirdPeerState.CONNECTED)]}
        settings={{ peers: 'pc' }}
      />,
    );
    expect(statusOf('pc')).toBe('offline');
  });

  it('shows a configured peer the daemon does not list as offline', () => {
    render(<NetbirdWidget peers={peers} settings={{ peers: 'pc-1,ghost' }} />);
    expect(names()).toEqual(['pc-1', 'ghost']);
    expect(statusOf('ghost')).toBe('offline');
  });
});
