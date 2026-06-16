/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TrelloID } from './TrelloID';

export type CustomField = {
  id?: TrelloID;
  idModel?: string;
  modelType?: CustomField.modelType;
  fieldGroup?: string;
  display?: {
    cardFront?: boolean;
    name?: string;
    pos?: string;
    options?: Array<{
      id?: TrelloID;
      idCustomField?: TrelloID;
      value?: {
        text?: string;
      };
      color?: string;
      pos?: number;
    }>;
  };
  type?: string;
};

export namespace CustomField {
  export enum modelType {
    CARD = 'card',
    BOARD = 'board',
    MEMBER = 'member',
  }
}
