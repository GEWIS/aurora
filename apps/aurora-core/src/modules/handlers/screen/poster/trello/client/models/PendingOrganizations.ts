/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TrelloID } from './TrelloID';

export type PendingOrganizations = {
  id?: TrelloID;
  idMember?: TrelloID;
  memberRequestor?: {
    id?: TrelloID;
    fullName?: string;
  };
  date?: string;
  displayName?: string;
  membershipCount?: number;
  logoUrl?: string | null;
  transferability?: {
    transferrable?: boolean;
    newBillableMembers?: Array<{
      id?: TrelloID;
      fullName?: string;
      username?: string;
      initials?: string;
      avatarHash?: string;
    }>;
    restrictedMembers?: Array<{
      id?: TrelloID;
      fullName?: string;
      username?: string;
      initials?: string;
      avatarHash?: string;
    }>;
  };
};
