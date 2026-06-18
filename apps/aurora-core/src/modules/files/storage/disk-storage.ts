import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import * as fs from 'fs';
import { FileStorage } from './file-storage';
import { IFile } from '../entities';

export default class DiskStorage extends FileStorage {
  private readonly rootDir = path.join(__dirname, '../../../../');

  private readonly relativeWorkdir: string;

  private readonly urlPath: string | undefined;

  /**
   * @param relativeDirectory Subdirectory name
   * @param filesArePublic Whether the stored files should be public (or not)
   */
  constructor(relativeDirectory: string, filesArePublic = true) {
    super(filesArePublic);
    if (filesArePublic) {
      this.relativeWorkdir = path.join('public', relativeDirectory);
      this.urlPath = path.join('/static', relativeDirectory);
    } else {
      this.relativeWorkdir = path.join('private', relativeDirectory);
    }

    const dirsToCreate: string[] = [];
    let currentDir = this.workdir;
    // In the given path, find all directories in the path that do not exist
    while (!fs.existsSync(currentDir)) {
      dirsToCreate.push(currentDir);
      currentDir = path.join(currentDir, '../');
    }
    // Create all directories from lowest to highest level (one directory at a time)
    dirsToCreate.reverse().forEach((dir) => fs.mkdirSync(dir));
  }

  private get workdir(): string {
    return path.join(this.rootDir, this.relativeWorkdir);
  }

  /**
   * Returns an uuidv4 string.
   * This separate function is created to make testing easier.
   */
  private static getRandomName() {
    return uuidv4();
  }

  private getRelativePath(fileName: string) {
    return path.join(this.relativeWorkdir, fileName);
  }

  private getFullPath(fileName: string) {
    return path.join(this.rootDir, this.getRelativePath(fileName));
  }

  async saveFile(fileName: string, fileData: Buffer): Promise<IFile> {
    const fileExtension = path.extname(fileName);
    const randomFileName = `${DiskStorage.getRandomName()}${fileExtension}`;
    const fileLocation = path.join(this.workdir, randomFileName);

    fs.writeFileSync(fileLocation, fileData);
    return {
      relativeDirectory: this.relativeWorkdir,
      name: randomFileName,
      originalName: fileName,
    };
  }

  getFile(file: IFile): Promise<Buffer> {
    const fullPath = this.getFullPath(file.name);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Given file does not exist on disk: ${fullPath}`);
    }

    const data = fs.readFileSync(fullPath);
    return Promise.resolve(data);
  }

  deleteFile(file: IFile): Promise<boolean> {
    const fullPath = this.getFullPath(file.name);
    if (!fs.existsSync(fullPath)) {
      return Promise.resolve(false);
    }

    fs.rmSync(fullPath);
    return Promise.resolve(true);
  }

  getPublicFileUri(file: IFile): string | null {
    if (!this.urlPath || !this.isPublic()) {
      // File is private
      return null;
    }

    let link = path.join(this.urlPath, file.name);
    if (process.platform === 'win32') {
      // Replace backslashes with forward slashes
      link = link.split('\\').join('/');
    }
    return link;
  }
}
