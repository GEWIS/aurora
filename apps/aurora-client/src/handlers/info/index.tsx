import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import {
  AgendaEvent,
  ConferenceRoomsResponse,
  getInfoAgenda,
  getInfoConferenceRooms,
  getInfoNews,
  getInfoOwnLayout,
  getInfoPcUsage,
  getInfoRainRadar,
  getInfoRoomStatus,
  getInfoServices,
  getInfoTrains,
  getInfoWeather,
  getSpotifyCurrentlyPlaying,
  InfoScreenLayoutResponse,
  NewsHeadline,
  PcStatusResponse,
  RainRadarResponse,
  RoomStatusResponse,
  ServicesHealthResponse,
  TrackChangeEvent,
  TrainResponse,
  WeatherResponse,
} from '@gewis/aurora-api-client';
import GeometricBackground, { BackgroundVariant } from './components/GeometricBackground';
import BeerOverlay from './components/BeerOverlay';
import CallerOverlay, { CallerEvent } from './components/CallerOverlay';
import { placementStyle, renderWidget, widgetTitle, WidgetData } from './WidgetRenderer';
import WidgetCard, { CONTAINER_WIDGET_IDS } from './WidgetCard';

interface Props {
  socket: Socket;
}

// Design canvas: fixed 1920×1080 with 9 columns and 8 rows, 16px gutters/margins.
// Expressed in rem (÷16) so the whole grid scales with the root font-size that
// AutoScaler derives from the screen's scaleFactor — no manual transform.
// Columns/rows fill the stage evenly (minmax(0,1fr)).
const COLUMNS = 9;
const ROWS = 8;
const GAP_REM = 16 / 16; // 1rem
const STAGE_W_REM = 1920 / 16; // 120rem
const STAGE_H_REM = 1080 / 16; // 67.5rem

/**
 * Config-driven info screen. The per-screen layout (fetched from the backend and
 * kept live over the `info_layout` socket event) decides which widgets are
 * placed where on the grid, plus which modal overlays (beer countdown, incoming
 * call) are enabled.
 */
export default function InfoScreenView({ socket }: Props) {
  const [layout, setLayout] = useState<InfoScreenLayoutResponse | null>(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [radar, setRadar] = useState<RainRadarResponse | null>(null);
  const [trains, setTrains] = useState<TrainResponse[]>([]);
  const [news, setNews] = useState<NewsHeadline[]>([]);
  const [agenda, setAgenda] = useState<AgendaEvent[]>([]);
  const [pcs, setPcs] = useState<PcStatusResponse[]>([]);
  const [roomStatus, setRoomStatus] = useState<RoomStatusResponse | null>(null);
  const [track, setTrack] = useState<TrackChangeEvent | null>(null);
  const [services, setServices] = useState<ServicesHealthResponse | null>(null);
  const [rooms, setRooms] = useState<ConferenceRoomsResponse | null>(null);
  const [caller, setCaller] = useState<CallerEvent | null>(null);

  // Initial data load over HTTP.
  useEffect(() => {
    getInfoOwnLayout().then((r) => setLayout(r.data ?? null)).catch(console.error);
    getInfoWeather().then((r) => setWeather(r.data ?? null)).catch(console.error);
    getInfoRainRadar().then((r) => setRadar(r.data ?? null)).catch(console.error);
    getInfoTrains().then((r) => setTrains(r.data ?? [])).catch(console.error);
    getInfoNews().then((r) => setNews(r.data ?? [])).catch(console.error);
    getInfoAgenda().then((r) => setAgenda(r.data ?? [])).catch(console.error);
    getInfoPcUsage().then((r) => setPcs(r.data ?? [])).catch(console.error);
    getInfoRoomStatus().then((r) => setRoomStatus(r.data ?? null)).catch(console.error);
    getInfoServices().then((r) => setServices(r.data ?? null)).catch(console.error);
    getInfoConferenceRooms().then((r) => setRooms(r.data ?? null)).catch(console.error);
    getSpotifyCurrentlyPlaying()
      .then((r) => setTrack(r.data?.[0] ?? null))
      .catch(console.error);
  }, []);

  // Live updates. Server events arrive wrapped in a single-element array.
  useEffect(() => {
    const onLayout = (p: unknown[]) => setLayout(p[0] as InfoScreenLayoutResponse);
    const onWeather = (p: unknown[]) => setWeather(p[0] as WeatherResponse);
    const onRadar = (p: unknown[]) => setRadar(p[0] as RainRadarResponse);
    const onTrains = (p: unknown[]) => setTrains(p[0] as TrainResponse[]);
    const onNews = (p: unknown[]) => setNews(p[0] as NewsHeadline[]);
    const onAgenda = (p: unknown[]) => setAgenda(p[0] as AgendaEvent[]);
    const onPcs = (p: unknown[]) => setPcs(p[0] as PcStatusResponse[]);
    const onRoom = (p: unknown[]) => setRoomStatus(p[0] as RoomStatusResponse);
    const onServices = (p: unknown[]) => setServices(p[0] as ServicesHealthResponse);
    const onRooms = (p: unknown[]) => setRooms(p[0] as ConferenceRoomsResponse);
    const onCaller = (p: unknown[]) => setCaller(p[0] as CallerEvent);
    const onTrack = (p: unknown[]) => setTrack((p[0] as TrackChangeEvent[])[0] ?? null);

    socket.on('info_layout', onLayout);
    socket.on('info_weather', onWeather);
    socket.on('info_rainradar', onRadar);
    socket.on('info_trains', onTrains);
    socket.on('info_news', onNews);
    socket.on('info_agenda', onAgenda);
    socket.on('info_pcusage', onPcs);
    socket.on('info_roomstatus', onRoom);
    socket.on('info_services', onServices);
    socket.on('info_conferencerooms', onRooms);
    socket.on('info_caller', onCaller);
    socket.on('change_track', onTrack);

    return () => {
      socket.off('info_layout', onLayout);
      socket.off('info_weather', onWeather);
      socket.off('info_rainradar', onRadar);
      socket.off('info_trains', onTrains);
      socket.off('info_news', onNews);
      socket.off('info_agenda', onAgenda);
      socket.off('info_pcusage', onPcs);
      socket.off('info_roomstatus', onRoom);
      socket.off('info_services', onServices);
      socket.off('info_conferencerooms', onRooms);
      socket.off('info_caller', onCaller);
      socket.off('change_track', onTrack);
    };
  }, [socket]);

  const data: WidgetData = {
    weather,
    radar,
    trains,
    news,
    agenda,
    pcs,
    roomStatus,
    track,
    services,
    rooms,
    caller,
  };

  const placements = layout?.placements ?? [];
  const modals = layout?.modals ?? [];

  return (
    <>
      <GeometricBackground
        variant={(layout?.background ?? 'hexagons') as BackgroundVariant}
        image={layout?.backgroundImage}
        color={layout?.backgroundColor}
      />
      {modals.includes('beer-modal') && <BeerOverlay beerTime={roomStatus?.beerTime ?? null} />}
      {modals.includes('caller') && <CallerOverlay event={caller} />}

      <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
        <div
          className="grid font-raleway"
          style={{
            width: `${STAGE_W_REM}rem`,
            height: `${STAGE_H_REM}rem`,
            gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
            gridAutoRows: 'minmax(0, 1fr)',
            gap: `${GAP_REM}rem`,
            padding: `${GAP_REM}rem`,
          }}
        >
          {placements.map((p) => {
            const content = renderWidget(p.id, data, p.settings ?? {}, p.children ?? []);
            if (!content) return null;
            // A per-widget `title` setting (e.g. on the clock) overrides the
            // default title; an explicit empty string hides it.
            const titleOverride = p.settings?.title;
            const title =
              typeof titleOverride === 'string' ? titleOverride : widgetTitle(p.id);
            return (
              <WidgetCard
                key={p.instanceId}
                id={p.id}
                title={title}
                style={placementStyle(p.x, p.y, p.w, p.h)}
                background={
                  CONTAINER_WIDGET_IDS.has(p.id)
                    ? undefined
                    : (p.settings?.panelBackground as string | undefined)
                }
                rows={p.h}
              >
                {content}
              </WidgetCard>
            );
          })}
        </div>
      </div>
    </>
  );
}
