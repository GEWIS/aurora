/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Color } from './Color';
import type { TrelloID } from './TrelloID';

export type Attachment = {
  id: TrelloID;
  bytes: number | null;
  date: string;
  edgeColor: Color | null;
  idMember: TrelloID;
  isUpload: boolean;
  mimeType: string;
  name: string;
  previews: {
    id: string;
    _id: string;
    scaled: boolean;
    url: string;
    bytes: number;
    height: number;
    width: number;
  }[];
  url: string;
  pos: number;
  fileName: string;
};
