/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Limits } from './Limits';
import type { TrelloID } from './TrelloID';

export type TrelloList = {
  id?: TrelloID;
  /**
   * The name of the list
   */
  name?: string;
  closed?: boolean;
  pos?: number;
  softLimit?: string;
  idBoard?: string;
  subscribed?: boolean;
  limits?: Limits;
};
