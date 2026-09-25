import { HttpStatusCode } from 'axios';

export { HttpStatusCode } from 'axios';

export class HttpApiException extends Error {
  /**
   * @deprecated Still present for backwards compatibility; use "status" instead
   */
  declare public readonly statusCode: number;
  declare public readonly status: number;
  // `message` is (re)defined below with `enumerable: true`: `new Error(msg)`
  // creates a non-enumerable own property, and bundler-transformed field
  // declarations cannot be relied on to override that. The backoffice and API
  // clients read `message` off serialized error bodies.
  declare public message: string;
  declare public name: string;

  constructor(status: HttpStatusCode, message?: string) {
    // Regex converts status code to space separated format
    // e.g. ImATeapot => Im A Teapot
    const statusCodeMessage = HttpStatusCode[status].replace(/([A-Z][a-z]*)/g, ' $1').trim();
    super(message ?? statusCodeMessage);

    this.name = statusCodeMessage;
    this.statusCode = status;
    this.status = status;
    Object.defineProperty(this, 'message', {
      value: message ?? statusCodeMessage,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }
}
