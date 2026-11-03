import type { UploadJournal, UploadEntry } from '../../src/upload-service';
export class InMemoryJournal implements UploadJournal {
  readonly entries: UploadEntry[] = [];
  async append(entry: UploadEntry): Promise<void> {
    this.entries.push({ ...entry });
  }
}
