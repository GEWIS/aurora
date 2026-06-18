import cron, { ScheduledTask } from 'node-cron';
import HandlerService from '../root/handler-service';
import logger from '../../logger';
import { TimedEvent } from './entities';
import { AuditService } from '../audit';
import HandlerManager from '../root/handler-manager';
import RootAudioService from '../root/root-audio-service';
import RootLightsService from '../root/root-lights-service';
import RootScreenService from '../root/root-screen-service';
import { Screen } from '../root/entities';
import { StaticPosterHandler } from '../handlers/screen';
import PosterService from '../handlers/screen/poster/local/poster-service';

export class CronExpressionError extends Error {}

export default class CronManager {
  private cronTasks: Map<number, ScheduledTask>;

  constructor(private eventIsSkipped: (event: TimedEvent) => Promise<void>) {
    this.cronTasks = new Map();
  }

  /**
   * Schedule an event
   * @param timedEvent
   */
  registerEvent(timedEvent: TimedEvent) {
    if (!cron.validate(timedEvent.cronExpression)) {
      throw new CronExpressionError('Invalid cron expression');
    }

    // Remove the old event first if it already exists
    this.removeEvent(timedEvent);

    const task = cron.schedule(timedEvent.cronExpression, this.handleEvent.bind(this, timedEvent));
    this.cronTasks.set(timedEvent.id, task);
  }

  /**
   * Unregister an event, such that it will not be scheduled anymore
   * @param timedEvent
   */
  removeEvent(timedEvent: TimedEvent) {
    if (this.cronTasks.has(timedEvent.id)) {
      const task = this.cronTasks.get(timedEvent.id)!;
      task.stop();
      this.cronTasks.delete(timedEvent.id);
    }
  }

  /**
   * Callbacks when an event should be executed
   * @param event
   */
  async handleEvent(event: TimedEvent): Promise<void> {
    const spec = event.eventSpec;
    try {
      if (event.skipNext) {
        logger.info(`Timed event "${event.id}": skip.`);
        event.skipNext = false;
        await this.eventIsSkipped(event);

        return;
      }

      switch (spec.type) {
        case 'system-reset':
          logger.audit(
            { id: 'cron', name: 'Scheduled Task', roles: [] },
            'Reset system state to default.',
          );
          await new HandlerService().resetToDefaults();
          break;

        case 'clean-audit-logs':
          logger.audit(
            { id: 'cron', name: 'Scheduled Task', roles: [] },
            `Remove audit logs older than ${process.env.AUDIT_LOGS_MAX_AGE_DAYS} days.`,
          );
          await new AuditService().removeExpiredAuditLogs();
          break;

        case 'switch-handler-audio':
          const audio = await new RootAudioService().getSingleAudio(spec.params.id);
          if (audio == null) {
            logger.error(`Timed event "${event.id}": audio with ID "${spec.params.id}" not found.`);
            return;
          }

          const foundAudio = HandlerManager.getInstance().registerHandler(
            audio,
            spec.params.handler,
          );
          if (!foundAudio) {
            logger.error(
              `Timed event "${event.id}": audio handler with name "${spec.params.handler}" not found.`,
            );
          }

          logger.audit(
            { id: 'cron', name: 'Scheduled Task', roles: [] },
            `Change "${audio.name}" (id: ${audio.id}) audio handler to "${spec.params.handler}".`,
          );

          return;

        case 'switch-handler-lights':
          const lights = await new RootLightsService().getSingleLightsGroup(spec.params.id);
          if (lights == null) {
            logger.error(
              `Timed event "${event.id}": lightsGroup with ID "${spec.params.id}" not found.`,
            );
            return;
          }

          const foundLights = HandlerManager.getInstance().registerHandler(
            lights,
            spec.params.handler,
          );
          if (!foundLights) {
            logger.error(
              `Timed event "${event.id}": lightsGroup handler with name "${spec.params.handler}" not found.`,
            );
          }

          logger.audit(
            { id: 'cron', name: 'Scheduled Task', roles: [] },
            `Change "${lights.name}" (id: ${lights.id}) lights handler to "${spec.params.handler}".`,
          );

          return;

        case 'switch-handler-screen':
          const screen = await new RootScreenService().getSingleScreen(spec.params.id);
          if (screen == null) {
            logger.error(
              `Timed event "${event.id}": screen with ID "${spec.params.id}" not found.`,
            );
            return;
          }

          const foundScreen = HandlerManager.getInstance().registerHandler(
            screen,
            spec.params.handler,
          );
          if (!foundScreen) {
            logger.error(
              `Timed event "${event.id}": screen handler with name "${spec.params.handler}" not found.`,
            );
          }

          logger.audit(
            { id: 'cron', name: 'Scheduled Task', roles: [] },
            `Change "${screen.name}" (id: ${screen.id}) screen handler to "${spec.params.handler}".`,
          );

          return;

        case 'timed-event-set-static-poster': {
          const service = new PosterService();
          const poster = await service.getSinglePoster(spec.params.posterId);
          const handler = HandlerManager.getInstance()
            .getHandlers(Screen)
            .filter(
              (h) => h.constructor.name === StaticPosterHandler.name,
            )[0] as StaticPosterHandler;
          if (handler) {
            handler.setActivePoster(service.toResponse(poster));
            handler.setClockVisibility(spec.params.clockVisible);
          } else {
            logger.error(
              `Timed event "${event.id}": could not find StaticPosterHandler in HandlerManager."`,
            );
          }

          return;
        }

        default:
          logger.error(`Timed event "${event.id}": unknown type "${(spec as any).type}".`);
      }
    } catch (error: unknown) {
      logger.error(`Timed event "${event.id}": ${error}`);
    }
  }
}
