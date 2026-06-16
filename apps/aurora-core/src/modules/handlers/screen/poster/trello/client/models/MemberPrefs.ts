/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type MemberPrefs = {
  timezoneInfo?: {
    offsetCurrent?: number;
    timezoneCurrent?: string;
    offsetNext?: number;
    dateNext?: string;
    timezoneNext?: string;
  };
  privacy?: {
    fullName?: MemberPrefs.fullName;
    avatar?: MemberPrefs.avatar;
  };
  sendSummaries?: boolean;
  minutesBetweenSummaries?: number;
  minutesBeforeDeadlineToNotify?: number;
  colorBlind?: boolean;
  locale?: string;
  timezone?: string;
  twoFactor?: {
    enabled?: boolean;
    needsNewBackups?: boolean;
  };
};

export namespace MemberPrefs {
  export enum fullName {
    PUBLIC = 'public',
    PRIVATE = 'private',
    COLLABORATOR = 'collaborator',
  }

  export enum avatar {
    PUBLIC = 'public',
    PRIVATE = 'private',
    COLLABORATOR = 'collaborator',
  }
}
