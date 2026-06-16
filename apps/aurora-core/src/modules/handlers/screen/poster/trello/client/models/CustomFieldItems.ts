/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TrelloID } from './TrelloID';

export type CustomFieldItems = {
  id?: TrelloID;
  value?: {
    checked?: string;
  };
  idCustomField?: TrelloID;
  idModel?: TrelloID;
  modelType?: CustomFieldItems.modelType;
};

export namespace CustomFieldItems {
  export enum modelType {
    CARD = 'card',
    BOARD = 'board',
    MEMBER = 'member',
  }
}
