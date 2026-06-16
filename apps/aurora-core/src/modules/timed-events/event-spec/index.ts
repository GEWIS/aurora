import TimedEventReset from './timed-event-reset';
import TimedEventCleanAuditLogs from './timed-event-clean-audit-logs';
import {
  TimedEventSwitchHandlerAudio,
  TimedEventSwitchHandlerLights,
  TimedEventSwitchHandlerScreen,
} from './timed-event-switch-handler';
import TimedEventSetStaticPoster from './timed-event-set-static-poster';

type EventSpec =
  | TimedEventReset
  | TimedEventCleanAuditLogs
  | TimedEventSwitchHandlerAudio
  | TimedEventSwitchHandlerLights
  | TimedEventSwitchHandlerScreen
  | TimedEventSetStaticPoster;

export default EventSpec;
