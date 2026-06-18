import { HttpStatusCode } from 'axios';

export { HttpStatusCode } from 'axios';

export class HttpApiException extends Error {
  /**
   * @deprecated Still present for backwards compatibility; use "status" instead
   */
  public statusCode: number;
  public status: number;
  public message: string;
  public name: string;

  constructor(status: HttpStatusCode, message?: string) {
    // Regex converts status code to space separated format
    // e.g. ImATeapot => Im A Teapot
    const statusCodeMessage = HttpStatusCode[status].replace(/([A-Z][a-z]*)/g, ' $1').trim();
    super(message ?? statusCodeMessage);

    this.name = statusCodeMessage;
    this.statusCode = status;
    this.status = status;
    this.message = message ?? statusCodeMessage;
  }
}
