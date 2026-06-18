import { Beat, Section, Segment, Tatum } from '@fostertheweb/spotify-web-sdk';

export interface BeatEvent {
  beat: Beat;
  segment?: Segment;
  section?: Section;
  tatum?: Tatum;
}

export interface TrackChangeEvent {
  title: string;
  artists: string[];
  startTime: Date;
  cover?: string;
  trackURI: string; // Either a Spotify Track URI (spotify:track:<id>) or
  // a local identifier (local:<id>)
}
