import { FeedEvent } from '../../../lights/mix-tape';
import { CenturionCommand } from './centurion-command';
import HornCommand from './horn-command';
import SongCommand from './song-command';
import EffectCommand from './effect-command';
import BpmCommand from './bpm-command';
import StopCommand from './stop-command';

/**
 * Convert a tape event to the command that plays it
 * @param event
 * @param hasDiscoball whether a disco ball is configured
 */
export function toCommand(event: FeedEvent, hasDiscoball: boolean): CenturionCommand {
  switch (event.type) {
    case 'horn':
      return new HornCommand(event);
    case 'song':
      return new SongCommand(event);
    case 'effect':
      return new EffectCommand(event, hasDiscoball);
    case 'bpm':
      return new BpmCommand(event);
    default:
      if (event.data === 'stop') return new StopCommand(event.timestamp);
      throw new Error(
        `Unknown centurion event at ${event.timestamp}: ${JSON.stringify(event.data)}`,
      );
  }
}
