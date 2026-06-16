/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TrelloID } from './TrelloID';

export type ClaimableOrganizations = {
  organizations?: Array<{
    name?: string;
    displayName?: string;
    activeMembershipCount?: number;
    idActiveAdmins?: Array<TrelloID>;
    products?: Array<number>;
    id?: TrelloID;
    logoUrl?: string | null;
    /**
     * The date of the most recent activity on any of the boards in the workspace. If the workspace has no boards, or the boards have no activity, this value will be null.
     */
    dateLastActive?: string | null;
  }>;
  claimableCount?: number;
};
