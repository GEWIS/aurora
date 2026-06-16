/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TrelloID } from './TrelloID';

export type CheckItem = {
  idChecklist: TrelloID;
  state: CheckItem.state;
  id: TrelloID;
  name: string;
  nameData: string | null;
  pos: string;
};

export namespace CheckItem {
  export enum state {
    COMPLETE = 'complete',
    INCOMPLETE = 'incomplete',
  }
}
