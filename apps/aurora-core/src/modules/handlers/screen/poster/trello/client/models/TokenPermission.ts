/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TrelloID } from './TrelloID';

export type TokenPermission = {
  idModel?: TrelloID | '*';
  modelType?: TokenPermission.modelType;
  read?: boolean;
  write?: boolean;
};

export namespace TokenPermission {
  export enum modelType {
    BOARD = 'board',
    MEMBER = 'member',
    ORGANIZATION = 'organization',
    ENTERPRISE = 'enterprise',
  }
}
