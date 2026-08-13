import PcStatus from './entities/pc-status';
import Keyholder from './entities/keyholder';
import RoomStatus from './entities/room-status';
import InfoScreenLayout from './entities/info-screen-layout';
import InfoLayoutPreset from './entities/info-layout-preset';
import Caller from './entities/caller';
import ConferenceRoom from './entities/conference-room';
import NewsSource from './entities/news-source';

export { default as PcStatus, PcStatusType } from './entities/pc-status';
export { default as Keyholder } from './entities/keyholder';
export { default as RoomStatus } from './entities/room-status';
export { default as InfoScreenLayout } from './entities/info-screen-layout';
export { default as InfoLayoutPreset } from './entities/info-layout-preset';
export { default as Caller } from './entities/caller';
export { default as ConferenceRoom } from './entities/conference-room';
export { default as NewsSource } from './entities/news-source';

export const Entities = [PcStatus, Keyholder, RoomStatus, InfoScreenLayout, InfoLayoutPreset, Caller, ConferenceRoom, NewsSource];
