import { IFile } from '../entities';

export abstract class FileStorage {
  protected constructor(private filesArePublic: boolean) {}

  /**
   * Save a file with the given name to storage
   * @return The location of the file
   */
  public abstract saveFile(fileName: string, fileData: Buffer): Promise<IFile>;

  /**
   * Get the file from storage as a buffer object
   * @throws Error when file could not be found in storage
   */
  public abstract getFile(file: IFile): Promise<Buffer>;

  /**
   * Delete the file from the storage system
   * @returns true when file was deleted, false when file does not exist in storage
   * @throws Error when file could not be deleted
   */
  public abstract deleteFile(file: IFile): Promise<boolean>;

  /**
   * Get the publicly accessible URI for the given file, if it exists
   * @param file
   */
  public abstract getPublicFileUri(file: IFile): string | null;

  /**
   * Returns whether the files stored by this instance are public
   */
  public isPublic() {
    return this.filesArePublic;
  }
}
