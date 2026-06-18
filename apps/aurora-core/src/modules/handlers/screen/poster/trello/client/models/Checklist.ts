/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TrelloID } from './TrelloID';
import { CheckItem } from './CheckItem';

export type Checklist = {
  id: TrelloID;
  name: string;
  idBoard: TrelloID;
  idCard: TrelloID;
  pos: number;
  checkItems: CheckItem[];
};
