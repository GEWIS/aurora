/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LimitsObject } from './LimitsObject';
import type { MemberPrefs } from './MemberPrefs';
import type { TrelloID } from './TrelloID';

export type Member = {
  id?: TrelloID;
  activityBlocked?: boolean;
  avatarHash?: string;
  avatarUrl?: string;
  bio?: string;
  bioData?: {
    emoji?: Record<string, any>;
  };
  confirmed?: boolean;
  fullName?: string;
  idEnterprise?: TrelloID;
  idEnterprisesDeactivated?: Array<string>;
  idMemberReferrer?: TrelloID | null;
  idPremOrgsAdmin?: Array<TrelloID>;
  initials?: string;
  memberType?: Member.memberType;
  /**
   * Profile data with restricted visibility. These fields are visible only to members of the
   * same organization. The values here (full name, for example) may differ from the values
   * at the top level of the response.
   *
   */
  nonPublic?: {
    fullName?: string;
    initials?: string;
    /**
     * A URL that references the non-public avatar for the member
     */
    avatarUrl?: string;
    avatarHash?: string;
  };
  /**
   * Whether the response contains non-public profile data for the member
   */
  nonPublicAvailable?: boolean;
  products?: Array<number>;
  url?: string;
  username?: string;
  status?: Member.status;
  aaEmail?: string | null;
  aaEnrolledDate?: string | null;
  aaId?: string | null;
  avatarSource?: Member.avatarSource;
  email?: string;
  gravatarHash?: string;
  idBoards?: Array<TrelloID>;
  idOrganizations?: Array<TrelloID>;
  idEnterprisesAdmin?: Array<TrelloID>;
  limits?: LimitsObject;
  loginTypes?: Array<'password' | 'saml'>;
  marketingOptIn?: {
    optedIn?: boolean;
    date?: string;
  };
  messagesDismissed?: {
    name?: string;
    count?: string;
    lastDismissed?: string;
    _id?: TrelloID;
  };
  oneTimeMessagesDismissed?: Array<string>;
  prefs?: MemberPrefs;
  trophies?: Array<string>;
  uploadedAvatarHash?: string;
  uploadedAvatarUrl?: string;
  premiumFeatures?: Array<string>;
  isAaMastered?: boolean;
  ixUpdate?: number;
  idBoardsPinned?: Array<TrelloID> | null;
};

export namespace Member {
  export enum memberType {
    NORMAL = 'normal',
    GHOST = 'ghost',
  }

  export enum status {
    DISCONNECTED = 'disconnected',
  }

  export enum avatarSource {
    GRAVATAR = 'gravatar',
    UPLOAD = 'upload',
  }
}
