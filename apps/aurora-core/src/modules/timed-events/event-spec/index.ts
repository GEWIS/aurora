import TimedEventReset from './timed-event-reset';
import TimedEventCleanAuditLogs from './timed-event-clean-audit-logs';
import {
  TimedEventSwitchHandlerAudio,
  TimedEventSwitchHandlerLights,
  TimedEventSwitchHandlerScreen,
} from './timed-event-switch-handler';
import TimedEventSetStaticPoster from './timed-event-set-static-poster';
import TimedEventSetScreenFilter from './timed-event-set-screen-filter';

type EventSpec =
  | TimedEventReset
  | TimedEventCleanAuditLogs
  | TimedEventSwitchHandlerAudio
  | TimedEventSwitchHandlerLights
  | TimedEventSwitchHandlerScreen
  | TimedEventSetStaticPoster
  | TimedEventSetScreenFilter;

export default EventSpec;
