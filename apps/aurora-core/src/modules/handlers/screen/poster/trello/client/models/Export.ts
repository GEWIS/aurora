/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TrelloID } from './TrelloID';

export type Export = {
  id?: TrelloID;
  status?: {
    attempts?: number;
    finished?: boolean;
    stage?: string;
  };
  startedAt?: string;
  size?: string | null;
  exportUrl?: string | null;
};
