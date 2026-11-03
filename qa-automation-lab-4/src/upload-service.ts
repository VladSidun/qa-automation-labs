export interface UploadFile {
  name: string;
  type: string;
  data: Uint8Array;
}
export interface StoredFile {
  id: string;
  url: string;
}
export interface FileStorage {
  upload(file: UploadFile): Promise<StoredFile>;
}
export interface UploadEntry extends StoredFile {
  name: string;
  size: number;
  uploadedAt: string;
}
export interface UploadJournal {
  append(entry: UploadEntry): Promise<void>;
}
export interface Clock {
  now(): Date;
}
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

export class UploadService {
  constructor(
    private storage: FileStorage,
    private journal: UploadJournal,
    private clock: Clock,
  ) {}
  async upload(file: UploadFile): Promise<UploadEntry> {
    // Розмір беремо з даних, а не з переданого опису.
    if (file.data.byteLength === 0 || file.data.byteLength > MAX_FILE_SIZE)
      throw new Error('INVALID_FILE_SIZE');
    if (!ALLOWED_TYPES.includes(file.type))
      throw new Error('INVALID_FILE_TYPE');
    const stored = await this.storage.upload(file);
    const entry = {
      ...stored,
      name: file.name,
      size: file.data.byteLength,
      uploadedAt: this.clock.now().toISOString(),
    };
    await this.journal.append(entry);
    return entry;
  }
}
