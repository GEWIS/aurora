/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TrelloID } from './TrelloID';

export type PluginData = {
  id?: TrelloID;
  idPlugin?: TrelloID;
  scope?: PluginData.scope;
  idModel?: TrelloID;
  value?: string;
  access?: PluginData.access;
};

export namespace PluginData {
  export enum scope {
    MEMBER = 'member',
    BOARD = 'board',
    ORGANIZATION = 'organization',
    CARD = 'card',
  }

  export enum access {
    PRIVATE = 'private',
    SHARED = 'shared',
  }
}
