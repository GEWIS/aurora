/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Checklist } from './Checklist';
import type { Color } from './Color';
import type { Label } from './Label';
import type { Limits } from './Limits';
import type { TrelloID } from './TrelloID';

export type Card = {
  id?: TrelloID;
  address?: string | null;
  badges?: {
    attachmentsByType?: {
      trello?: {
        board?: number;
        card?: number;
      };
    };
    location?: boolean;
    votes?: number;
    viewingMemberVoted?: boolean;
    subscribed?: boolean;
    fogbugz?: string;
    checkItems?: number;
    checkItemsChecked?: number;
    comments?: number;
    attachments?: number;
    description?: boolean;
    due?: string | null;
    start?: string | null;
    dueComplete?: boolean;
  };
  checkItemStates?: Array<string>;
  closed?: boolean;
  coordinates?: string | null;
  creationMethod?: string | null;
  dateLastActivity?: string;
  desc?: string;
  descData?: {
    emoji?: Record<string, any>;
  };
  due?: string | null;
  dueReminder?: string | null;
  email?: string;
  idBoard?: TrelloID;
  idChecklists?: Array<Checklist | TrelloID>;
  idLabels?: Array<Label | TrelloID>;
  idList?: TrelloID;
  idMembers?: Array<TrelloID>;
  idMembersVoted?: Array<TrelloID>;
  idShort?: number;
  idAttachmentCover?: TrelloID | null;
  labels?: Array<Label>;
  limits?: Limits;
  locationName?: string | null;
  manualCoverAttachment?: boolean;
  name?: string;
  pos?: number;
  shortLink?: string;
  shortUrl?: string;
  subscribed?: boolean;
  url?: string;
  cover?: {
    idAttachment?: TrelloID | null;
    color?: Color | null;
    idUploadedBackground?: boolean | null;
    size?: Card.size;
    brightness?: Card.brightness;
    isTemplate?: boolean;
  };
};

export namespace Card {
  export enum size {
    NORMAL = 'normal',
  }

  export enum brightness {
    LIGHT = 'light',
    DARK = 'dark',
  }
}
