/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CardAging } from './CardAging';
import type { ImageDescriptor } from './ImageDescriptor';
import type { TrelloID } from './TrelloID';

export type Prefs = {
  permissionLevel?: Prefs.permissionLevel;
  hideVotes?: boolean;
  voting?: Prefs.voting;
  comments?: string;
  invitations?: Prefs.invitations;
  selfJoin?: boolean;
  cardCovers?: boolean;
  isTemplate?: boolean;
  cardAging?: CardAging;
  calendarFeedEnabled?: boolean;
  background?: TrelloID;
  backgroundImage?: string;
  backgroundImageScaled?: Array<ImageDescriptor>;
  backgroundTile?: boolean;
  backgroundBrightness?: string;
  backgroundBottomColor?: string;
  backgroundTopColor?: string;
  canBePublic?: boolean;
  canBeEnterprise?: boolean;
  canBeOrg?: boolean;
  canBePrivate?: boolean;
  canInvite?: boolean;
};

export namespace Prefs {
  export enum permissionLevel {
    ORG = 'org',
    BOARD = 'board',
  }

  export enum voting {
    DISABLED = 'disabled',
    ENABLED = 'enabled',
  }

  export enum invitations {
    ADMINS = 'admins',
    MEMBERS = 'members',
  }
}
