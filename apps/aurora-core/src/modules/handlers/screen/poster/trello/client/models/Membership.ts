/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Membership = {
  managed?: boolean;
  licensed?: boolean;
  admin?: boolean;
  deactivated?: boolean;
  collaborator?: boolean;
  member?: {
    id?: string;
    fullname?: string;
    username?: string;
    dateLastImpression?: string;
    email?: string;
    initials?: string;
    avatarURL?: string;
    memberType?: string;
    confirmed?: boolean;
  };
};
