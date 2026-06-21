import { type HttpApiException } from '@gewis/aurora-api-client';
import { toastError } from '@/utils/toastHandler';
import { client } from '@gewis/aurora-api-client/client';

/**
 * Fetch interceptor
 * Handles errors and toasts
 */
client.interceptors.response.use((response: Response) => {
  // Let toast implicitly handle each error
  if (response.status >= 400) {
    let httpException: HttpApiException | undefined;
    void response
      .clone()
      .json()
      .then((err: HttpApiException) => {
        toastError({
          title: err.name,
          body: err.message,
        });
        httpException = err;
      });
    if (httpException) {
      throw new Error(httpException.message);
    }
  }
  // The only responsibility of a promise is now to "clean up" any side effects of errors
  // The actual error logging is handled by the interceptor and toast handler
  return response;
});
