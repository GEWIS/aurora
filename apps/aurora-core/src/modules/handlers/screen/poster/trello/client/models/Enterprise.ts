/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TrelloID } from './TrelloID';

export type Enterprise = {
  id?: TrelloID;
  name?: string;
  displayName?: string;
  logoHash?: string | null;
  logoUrl?: string | null;
  prefs?: {
    ssoOnly?: boolean;
    signup?: {
      banner?: string;
      bannerHtml?: string;
    };
    mandatoryTransferDate?: string | null;
    brandingColor?: string;
    autoJoinOrganizations?: boolean;
    notifications?: Record<string, any>;
    maxMembers?: number | null;
  };
  organizationPrefs?: {
    boardVisibilityRestrict?: Record<string, any>;
    boardDeleteRestrict?: Record<string, any>;
    attachmentRestrictions?: Array<
      'computer' | 'trello' | 'google-drive' | 'box' | 'onedrive' | 'link'
    >;
  };
  ssoActivationFailed?: boolean;
  idAdmins?: Array<TrelloID>;
  enterpriseDomains?: Array<string>;
  isRealEnterprise?: boolean;
  pluginWhitelistingEnabled?: Array<TrelloID>;
  idOrganizations?: Array<TrelloID>;
  products?: Array<number>;
  licenses?: {
    maxMembers?: number | null;
    totalMembers?: number;
    relatedEnterprises?: Array<{
      name?: string;
      displayName?: string;
      count?: number;
    }>;
  };
  domains?: Array<string>;
  dateOrganizationPrefsLastUpdated?: string;
  idp?: {
    requestSigned?: boolean;
    certificate?: string | null;
    loginUrl?: string | null;
  };
};
