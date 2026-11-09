import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import logger from '../../../../logger';

const execFileAsync = promisify(execFile);

/**
 * A peer's connection state as seen by the NetBird daemon on the Aurora host.
 * The client shows `connected` as green, `connecting` as orange and `offline`
 * as gray.
 */
export type NetbirdPeerState = 'connected' | 'connecting' | 'offline';

export interface NetbirdPeerStatus {
  /** First label of the FQDN, e.g. "aurora" for "aurora.netbird.cloud". */
  name: string;
  fqdn: string;
  state: NetbirdPeerState;
}

/** The part of the netbird output this service reads. */
export interface NetbirdStatusOutput {
  lazyConnectionEnabled?: boolean;
  peers?: {
    details?: { fqdn: string; status: string }[];
  };
}

const TIMEOUT = 5_000;

const MAX_BUFFER = 8 * 1024 * 1024;

/** NetBird's peer statuses that are not offline. */
const NETBIRD_STATES: Record<string, NetbirdPeerState> = {
  Connected: 'connected',
  Connecting: 'connecting',
};

/**
 * Reports the state of the peers in the NetBird mesh, read from the NetBird
 * daemon running on the same host as Aurora (`netbird status --json`). Only
 * peers that this host may see under the mesh's access policies are listed.
 */
export default class NetbirdStatusService {
  private static warnedLazy = false;

  public async getPeers(): Promise<NetbirdPeerStatus[]> {
    const { stdout } = await execFileAsync('netbird', ['status', '--json'], {
      timeout: TIMEOUT,
      maxBuffer: MAX_BUFFER,
    });
    const output = JSON.parse(stdout) as NetbirdStatusOutput;

    if (output.lazyConnectionEnabled && !NetbirdStatusService.warnedLazy) {
      logger.warn(
        'NetBird lazy connections are enabled on this host; idle peers will show as offline.',
      );
      NetbirdStatusService.warnedLazy = true;
    }

    return NetbirdStatusService.transform(output);
  }

  /**
   * Map the daemon's peer list onto the widget shape, keeping only the name,
   * FQDN and state. Everything else (public keys, ICE endpoints, which are the
   * public IPs of devices) must not reach the screens.
   */
  public static transform(output: NetbirdStatusOutput): NetbirdPeerStatus[] {
    return (output.peers?.details ?? []).map(({ fqdn, status }) => ({
      name: fqdn.split('.')[0],
      fqdn,
      state: NETBIRD_STATES[status] ?? 'offline',
    }));
  }
}
