import path from 'path';
import { fromBuffer } from 'file-type';
import { HttpStatusCode } from 'axios';
import { HttpApiException } from '../../../../../helpers/custom-error';
import { PosterType } from './poster';

/**
 * File types that can be attached to a poster request, with the resulting poster type and the
 * extension the file is stored with.
 */
const POSTER_REQUEST_FILE_TYPES: Record<
  string,
  { type: PosterType.IMAGE | PosterType.VIDEO; extension: string }
> = {
  'image/jpeg': { type: PosterType.IMAGE, extension: 'jpg' },
  'image/png': { type: PosterType.IMAGE, extension: 'png' },
  'video/mp4': { type: PosterType.VIDEO, extension: 'mp4' },
};

const MAX_FILE_NAME_LENGTH = 100;
const DEFAULT_FILE_NAME = 'poster';

/**
 * A file that has been checked and can be stored for a poster request.
 */
export interface ValidatedPosterRequestFile {
  type: PosterType.IMAGE | PosterType.VIDEO;
  /**
   * Safe file name, with the extension of the detected file type.
   */
  name: string;
  data: Buffer;
  mimeType: string;
}

/**
 * Determine the mime type of the given file from its contents.
 * @param data
 */
export async function getMimeType(data: Buffer): Promise<string | undefined> {
  return (await fromBuffer(data))?.mime;
}

/**
 * Build a safe file name from the name given by the requester. Only the base name is kept,
 * without its extension, unusual characters are replaced and the length is limited. The
 * extension always follows from the detected file type, as the stored file is later served
 * based on its extension.
 * @param originalName
 * @param extension
 */
export function toSafeFileName(originalName: string, extension: string): string {
  const base = path
    .basename(originalName.replace(/\\/g, '/'))
    .replace(/\.[^.]*$/, '')
    .replace(/[^A-Za-z0-9 ._-]/g, '_')
    .replace(/^[.\s]+/, '')
    .trim()
    .slice(0, MAX_FILE_NAME_LENGTH);
  return `${base || DEFAULT_FILE_NAME}.${extension}`;
}

/**
 * Check an uploaded poster request file, rejecting anything that is not a JPG, PNG or MP4.
 * The file size is already limited by the upload handler.
 * @param originalName File name given by the requester.
 * @param data File contents.
 */
export async function validatePosterRequestFile(
  originalName: string,
  data: Buffer,
): Promise<ValidatedPosterRequestFile> {
  const mimeType = await getMimeType(data);
  const fileType = mimeType ? POSTER_REQUEST_FILE_TYPES[mimeType] : undefined;
  if (!mimeType || !fileType) {
    throw new HttpApiException(
      HttpStatusCode.UnsupportedMediaType,
      'Invalid file type, expected a JPG, PNG or MP4 file.',
    );
  }

  return {
    type: fileType.type,
    name: toSafeFileName(originalName, fileType.extension),
    data,
    mimeType,
  };
}
