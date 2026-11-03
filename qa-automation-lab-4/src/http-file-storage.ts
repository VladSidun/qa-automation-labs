import type { FileStorage, UploadFile, StoredFile } from './upload-service';
export class HttpFileStorage implements FileStorage {
  constructor(private baseUrl: string) {}
  async upload(file: UploadFile): Promise<StoredFile> {
    const form = new FormData();
    form.append(
      'file',
      new Blob([new Uint8Array(file.data)], { type: file.type }),
      file.name,
    );
    const response = await fetch(`${this.baseUrl}/files`, {
      method: 'POST',
      body: form,
    });
    if (!response.ok) throw new Error('UPLOAD_UNAVAILABLE');
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new Error('INVALID_UPLOAD_FORMAT');
    }
    if (
      typeof data !== 'object' ||
      data === null ||
      !('id' in data) ||
      !('url' in data) ||
      typeof data.id !== 'string' ||
      data.id.length === 0 ||
      typeof data.url !== 'string' ||
      data.url.length === 0
    ) {
      throw new Error('INVALID_UPLOAD_FORMAT');
    }
    return { id: data.id, url: data.url };
  }
}
