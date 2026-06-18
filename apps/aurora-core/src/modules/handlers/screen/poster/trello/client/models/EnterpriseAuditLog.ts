/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TrelloID } from './TrelloID';

export type EnterpriseAuditLog = {
  idAction?: TrelloID;
  type?: string;
  date?: string;
  memberCreator?: {
    id?: TrelloID;
    username?: string;
    fullName?: string;
  };
  organization?: {
    enterpriseJoinRequest?: {
      idEnterprise?: TrelloID;
      idMember?: TrelloID;
      date?: string;
    } | null;
    id?: TrelloID;
    name?: string;
  };
  member?: {
    id?: TrelloID;
    username?: string;
    fullName?: string;
  };
};
