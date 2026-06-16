/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type LimitsObject = {
  status?: LimitsObject.status;
  disableAt?: number;
  warnAt?: number;
};

export namespace LimitsObject {
  export enum status {
    OK = 'ok',
    WARNING = 'warning',
  }
}
