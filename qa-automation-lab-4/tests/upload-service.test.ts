import type { Mock } from 'vitest';
import type { FileStorage } from '../src/upload-service';
import { beforeEach, expect, it, vi } from 'vitest';
import {
  MAX_FILE_SIZE,
  UploadService,
  type UploadFile,
} from '../src/upload-service';
import { InMemoryJournal } from './fakes/in-memory-journal';
let journal: InMemoryJournal;
let storage: { upload: Mock<FileStorage['upload']> };
let service: UploadService;
const now = '2026-11-03T10:00:00.000Z';
const file = (size = 10, type = 'application/pdf'): UploadFile => ({
  name: 'report.pdf',
  type,
  data: new Uint8Array(size),
});
beforeEach(() => {
  journal = new InMemoryJournal();
  storage = {
    upload: vi
      .fn()
      .mockResolvedValue({ id: 'F-1', url: 'https://storage.example.com/F-1' }),
  };
  service = new UploadService(storage, journal, { now: () => new Date(now) });
});
it.each(['application/pdf', 'image/png', 'image/jpeg'])(
  'приймає %s і записує результат',
  async (type) => {
    const input = file(10, type);
    const entry = await service.upload(input);
    expect(entry).toEqual({
      id: 'F-1',
      url: 'https://storage.example.com/F-1',
      name: 'report.pdf',
      size: 10,
      uploadedAt: now,
    });
    expect(journal.entries).toEqual([entry]);
    expect(storage.upload).toHaveBeenCalledExactlyOnceWith(input);
  },
);
it.each([1, MAX_FILE_SIZE - 1, MAX_FILE_SIZE])(
  'дозволяє розмір %i',
  async (size) => {
    await service.upload(file(size));
    expect(journal.entries[0].size).toBe(size);
  },
);
it.each([0, MAX_FILE_SIZE + 1])(
  'відхиляє розмір %i без побічних дій',
  async (size) => {
    await expect(service.upload(file(size))).rejects.toThrow(
      'INVALID_FILE_SIZE',
    );
    expect(storage.upload).not.toHaveBeenCalled();
    expect(journal.entries).toEqual([]);
  },
);
it.each(['text/plain', '', 'application/x-msdownload'])(
  'відхиляє тип %s без журналу',
  async (type) => {
    await expect(service.upload(file(1, type))).rejects.toThrow(
      'INVALID_FILE_TYPE',
    );
    expect(storage.upload).not.toHaveBeenCalled();
    expect(journal.entries).toEqual([]);
  },
);
it('не пише успіх у журнал за відмови сховища', async () => {
  storage.upload.mockRejectedValue(new Error('UPLOAD_UNAVAILABLE'));
  await expect(service.upload(file())).rejects.toThrow('UPLOAD_UNAVAILABLE');
  expect(journal.entries).toEqual([]);
});
it('передає відмову журналу після успішного завантаження', async () => {
  vi.spyOn(journal, 'append').mockRejectedValue(new Error('JOURNAL_FAILED'));
  await expect(service.upload(file())).rejects.toThrow('JOURNAL_FAILED');
  expect(storage.upload).toHaveBeenCalledTimes(1);
  expect(journal.entries).toEqual([]);
});
