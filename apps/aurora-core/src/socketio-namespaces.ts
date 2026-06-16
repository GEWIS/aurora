export enum SocketioNamespaces {
  BASE = '/',
  AUDIO = '/audio',
  SCREEN = '/screen',
  LIGHTS = '/lights',
  PUBLIC = '/public',
  BACKOFFICE = '/backoffice',
  BACKOFFICE_BEAT = '/backoffice-beat',
}

// List of namespaces which can only be listened to when authenticated.
export const SECURE_NAMESPACES = [
  SocketioNamespaces.BASE,
  SocketioNamespaces.AUDIO,
  SocketioNamespaces.SCREEN,
  SocketioNamespaces.LIGHTS,
  SocketioNamespaces.BACKOFFICE,
  SocketioNamespaces.BACKOFFICE_BEAT,
];
