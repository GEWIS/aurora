import { CSSProperties, ReactNode } from 'react';
import {
  AgendaEvent,
  ChildWidget,
  ConferenceRoomsResponse,
  NewsHeadline,
  PcStatusResponse,
  RainRadarResponse,
  RoomStatusResponse,
  ServicesHealthResponse,
  TrackChangeEvent,
  TrainResponse,
  WeatherResponse,
} from '@gewis/aurora-api-client';
import InfoClock from './components/InfoClock';
import WeatherForecastWidget from './components/WeatherForecastWidget';
import RoomStatusWidget from './components/RoomStatusWidget';
import BeerPanel from './components/BeerPanel';
import SpotifyBar from './components/SpotifyBar';
import AgendaWidget from './components/AgendaWidget';
import TrainsWidget from './components/TrainsWidget';
import NewsTicker from './components/NewsTicker';
import PcUsageMap from './components/PcUsageMap';
import ServicesWidget from './components/ServicesWidget';
import ConferenceRoomsWidget from './components/ConferenceRoomsWidget';
import CoffeeWidget from './components/CoffeeWidget';
import LogoFlip from './components/LogoFlip';
import CarouselWidget from './components/CarouselWidget';
import StatusStackWidget from './components/StatusStackWidget';
import CallerInlineWidget from './components/CallerInlineWidget';
import TextWidget from './components/TextWidget';
import ImageWidget from './components/ImageWidget';
import { CallerEvent } from './components/CallerOverlay';
import WidgetCard from './WidgetCard';
import { WidgetSettings } from './settings';

/** All widget data the renderer needs, kept in one bundle for convenience. */
export interface WidgetData {
  weather: WeatherResponse | null;
  radar: RainRadarResponse | null;
  trains: TrainResponse[];
  news: NewsHeadline[];
  agenda: AgendaEvent[];
  pcs: PcStatusResponse[];
  roomStatus: RoomStatusResponse | null;
  track: TrackChangeEvent | null;
  services: ServicesHealthResponse | null;
  rooms: ConferenceRoomsResponse | null;
  caller: CallerEvent | null;
}

/** Panel title shown above a widget, or undefined for widgets that self-title. */
const TITLES: Record<string, string | undefined> = {
  clock: 'Eindhoven Time',
  weather: 'Weather forecast',
  'room-responsible': undefined,
  beer: 'Beer time',
  spotify: 'Spotify',
  events: 'Events today',
  trains: 'Departures',
  news: undefined,
  workstations: 'Workstation status',
  services: 'GEWIS services',
  'conference-rooms': 'Conference rooms',
  logo: undefined,
  coffee: 'Coffee status',
  'caller-inline': 'Caller',
  text: undefined,
  image: undefined,
  carousel: undefined,
  'status-stack': undefined,
};

/** The grid-placeable widget ids this renderer can render. */
export const SUPPORTED_WIDGET_IDS = Object.keys(TITLES);

export function widgetTitle(id: string): string | undefined {
  return TITLES[id];
}

/** CSS Grid placement for a widget rectangle (1-based grid lines). */
export function placementStyle(x: number, y: number, w: number, h: number): CSSProperties {
  return {
    gridColumn: `${x + 1} / span ${w}`,
    gridRow: `${y + 1} / span ${h}`,
  };
}

/** Render a single grid widget by id, or null if the id is unknown. */
export function renderWidget(
  id: string,
  data: WidgetData,
  settings: WidgetSettings = {},
  children: ChildWidget[] = [],
): ReactNode | null {
  // Each container child is wrapped in its own card so it carries its own
  // background/title (the container itself is transparent).
  const renderChild = (c: ChildWidget) => (
    <WidgetCard
      id={c.id}
      title={widgetTitle(c.id)}
      background={c.settings?.panelBackground as string | undefined}
      rows={2}
    >
      {renderWidget(c.id, data, c.settings ?? {})}
    </WidgetCard>
  );
  switch (id) {
    case 'clock':
      return <InfoClock settings={settings} />;
    case 'weather':
      return <WeatherForecastWidget weather={data.weather} radar={data.radar} settings={settings} />;
    case 'room-responsible':
      return <RoomStatusWidget status={data.roomStatus} settings={settings} />;
    case 'beer':
      return (
        <BeerPanel
          beerTime={data.roomStatus?.beerTime ?? null}
          lastCall={data.roomStatus?.lastCall ?? null}
          settings={settings}
        />
      );
    case 'spotify':
      return <SpotifyBar track={data.track} settings={settings} />;
    case 'events':
      return <AgendaWidget events={data.agenda} settings={settings} />;
    case 'trains':
      return <TrainsWidget trains={data.trains} settings={settings} />;
    case 'news':
      return <NewsTicker headlines={data.news} settings={settings} />;
    case 'workstations':
      return <PcUsageMap pcs={data.pcs} settings={settings} />;
    case 'services':
      return <ServicesWidget services={data.services} settings={settings} />;
    case 'conference-rooms':
      return <ConferenceRoomsWidget rooms={data.rooms} settings={settings} />;
    case 'coffee':
      return <CoffeeWidget status={data.roomStatus?.coffeeStatus ?? 0} />;
    case 'logo':
      return <LogoFlip settings={settings} />;
    case 'caller-inline':
      return <CallerInlineWidget caller={data.caller} settings={settings} />;
    case 'text':
      return <TextWidget settings={settings} />;
    case 'image':
      return <ImageWidget settings={settings} />;
    case 'carousel':
      return <CarouselWidget items={children} settings={settings} renderChild={renderChild} />;
    case 'status-stack':
      return (
        <StatusStackWidget
          items={children}
          caller={data.caller}
          track={data.track}
          settings={settings}
          renderChild={renderChild}
        />
      );
    default:
      return null;
  }
}
