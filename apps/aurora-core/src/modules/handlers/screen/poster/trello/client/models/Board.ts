/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Limits } from './Limits';
import type { Prefs } from './Prefs';
import type { TrelloID } from './TrelloID';
import { Card } from './Card';
import { TrelloList } from './TrelloList';
import { Checklist } from './Checklist';

export type Board = {
  id: TrelloID;
  /**
   * The name of the board.
   */
  name?: string;
  desc?: string;
  descData?: string;
  closed?: boolean;
  idMemberCreator?: TrelloID;
  idOrganization?: TrelloID;
  pinned?: boolean;
  url?: string;
  shortUrl?: string;
  prefs?: Prefs;
  labelNames?: {
    green?: string;
    yellow?: string;
    orange?: string;
    red?: string;
    purple?: string;
    blue?: string;
    sky?: string;
    lime?: string;
    pink?: string;
    black?: string;
  };
  limits?: Limits;
  starred?: boolean;
  memberships?: string;
  shortLink?: string;
  subscribed?: boolean;
  powerUps?: string;
  dateLastActivity?: string;
  dateLastView?: string;
  idTags?: string;
  datePluginDisable?: string | null;
  creationMethod?: string | null;
  ixUpdate?: number;
  templateGallery?: string | null;
  enterpriseOwned?: boolean;

  // Manually added by Roy, because this does not seem to be in the API spec, even though it is mentioned in the docs
  cards?: Card[];
  lists?: TrelloList[];
  checklists?: Checklist[];
};
