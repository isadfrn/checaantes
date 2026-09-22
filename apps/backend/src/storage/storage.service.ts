export interface UploadFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export abstract class StorageService {
  abstract save(file: UploadFile, keyPrefix: string): Promise<string>;

  abstract remove(url: string): Promise<void>;
}
