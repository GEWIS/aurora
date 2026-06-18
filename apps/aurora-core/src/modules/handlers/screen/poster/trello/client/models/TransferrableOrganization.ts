/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TrelloID } from './TrelloID';

export type TransferrableOrganization = {
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
