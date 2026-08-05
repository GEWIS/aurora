export interface StreamFeatures {
  seekable: boolean;
  hasDuration: boolean;
  live: boolean;
}

export interface ResolvedStream {
  title: string;
  duration: number | null;
  features: StreamFeatures;
}

export interface StreamUrls {
  whepUrl: string; // browsers / screens
  rtspUrl: string; // audio PC
}
