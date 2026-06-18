/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Color } from './Color';
import type { TrelloID } from './TrelloID';

export type Label = {
  /**
   * The ID of the label.
   */
  id?: TrelloID;
  /**
   * The ID of the board the label is on.
   */
  idBoard?: TrelloID;
  /**
   * The name displayed for the label.
   */
  name?: string | null;
  /**
   * The color of the label. Null means no color and the label will not be shown on the front of Cards.
   */
  color?: Color;
};
