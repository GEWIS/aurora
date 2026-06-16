import { SecurityGroup } from './security';

export interface ISecuritySections {
  base?: SecurityGroup[];
  privileged?: SecurityGroup[];
  subscriber?: SecurityGroup[];
}

export interface ISecurityGroups {
  user: ISecuritySections;
  color: ISecuritySections;
  audit: ISecuritySections;
  beats: ISecuritySections;
  gdrp: ISecuritySections;
  scenes: ISecuritySections;
  effects: ISecuritySections;
  poster: ISecuritySections;
  roomresponsible: ISecuritySections;
  centurion: ISecuritySections;
  timetrail: ISecuritySections;
  mode: ISecuritySections;
  handler: ISecuritySections;
  audio: ISecuritySections;
  light: ISecuritySections;
  screen: ISecuritySections;
  lightOperation: ISecuritySections;
  spotify: ISecuritySections;
  sudosos: ISecuritySections;
  serverSettings: ISecuritySections;
  orders: ISecuritySections;
  timedEvents: ISecuritySections;
  integrationUsers: ISecuritySections;
}

/**
 * Note; destructing inside is not possible, since tsoa access them before compilation
 */
const privilegedSecurityGroups = [SecurityGroup.ADMIN, SecurityGroup.BOARD, SecurityGroup.AVICO];

const baseSecurityGroups = [
  SecurityGroup.ADMIN,
  SecurityGroup.BOARD,
  SecurityGroup.AVICO,
  SecurityGroup.BAC,
];

const allSecurityGroups = [
  SecurityGroup.ADMIN,
  SecurityGroup.BOARD,
  SecurityGroup.AVICO,
  SecurityGroup.BAC,
  SecurityGroup.KEY_HOLDER,
];

const allSecuritySubscriberGroups = [
  SecurityGroup.ADMIN,
  SecurityGroup.BOARD,
  SecurityGroup.AVICO,
  SecurityGroup.BAC,
  SecurityGroup.KEY_HOLDER,
  SecurityGroup.AUDIO_SUBSCRIBER,
  SecurityGroup.SCREEN_SUBSCRIBER,
  SecurityGroup.LIGHTS_SUBSCRIBER,
  SecurityGroup.INTEGRATION_USER,
];

/**
 * Security groups that are available for each endpoint
 * Giving specific type will break tsoa; can only be done after the fact
 */
export const securityGroups = {
  user: {
    base: allSecuritySubscriberGroups,
  },
  color: {
    base: allSecuritySubscriberGroups,
  },
  audit: {
    base: allSecurityGroups,
  },
  beats: {
    base: [
      SecurityGroup.ADMIN,
      SecurityGroup.BAC,
      SecurityGroup.BOARD,
      SecurityGroup.AVICO,
      SecurityGroup.INTEGRATION_USER,
    ],
    privileged: [SecurityGroup.ADMIN],
  },
  gdrp: {
    base: [SecurityGroup.ADMIN],
  },
  scenes: {
    base: baseSecurityGroups,
    privileged: [SecurityGroup.ADMIN, SecurityGroup.AVICO],
  },
  effects: {
    base: baseSecurityGroups,
    privileged: [SecurityGroup.ADMIN],
  },
  poster: {
    base: allSecuritySubscriberGroups,
    privileged: privilegedSecurityGroups,
    subscriber: [SecurityGroup.SCREEN_SUBSCRIBER],
  },
  roomresponsible: {
    base: [SecurityGroup.SCREEN_SUBSCRIBER],
  },
  centurion: {
    base: allSecuritySubscriberGroups,
    privileged: baseSecurityGroups,
  },
  timetrail: {
    base: [SecurityGroup.ADMIN, SecurityGroup.BOARD, SecurityGroup.AVICO, SecurityGroup.BAC],
    subscriber: [SecurityGroup.SCREEN_SUBSCRIBER],
  },
  mode: {
    base: baseSecurityGroups,
  },
  handler: {
    base: allSecurityGroups,
    privileged: baseSecurityGroups,
  },
  audio: {
    base: allSecurityGroups,
    privileged: [SecurityGroup.ADMIN],
    subscriber: [SecurityGroup.AUDIO_SUBSCRIBER],
  },
  light: {
    base: allSecurityGroups,
    privileged: [SecurityGroup.ADMIN],
    subscriber: [SecurityGroup.LIGHTS_SUBSCRIBER],
  },
  screen: {
    base: allSecurityGroups,
    privileged: [SecurityGroup.ADMIN],
    subscriber: [SecurityGroup.SCREEN_SUBSCRIBER],
  },
  lightOperation: {
    base: baseSecurityGroups,
  },
  spotify: {
    base: allSecuritySubscriberGroups,
    privileged: [SecurityGroup.ADMIN],
  },
  sudosos: {
    subscriber: [SecurityGroup.SCREEN_SUBSCRIBER],
  },
  serverSettings: {
    base: allSecurityGroups,
    privileged: [SecurityGroup.ADMIN],
  },
  orders: {
    base: allSecuritySubscriberGroups,
    privileged: baseSecurityGroups,
  },
  timedEvents: {
    base: allSecurityGroups,
    privileged: [SecurityGroup.ADMIN],
  },
  integrationUsers: {
    privileged: [SecurityGroup.ADMIN],
  },
};

// Since object above cannot be type directly, we cast it here
// Any "big" issues will be caught by Typescript compiler this way
export const typedSecurityGroups = securityGroups as ISecurityGroups;
