import { expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { HttpFileStorage } from '../src/http-file-storage';
import { UploadService } from '../src/upload-service';
import { InMemoryJournal } from './fakes/in-memory-journal';
import { server, UPLOAD_URL } from './msw/server';
const storage = new HttpFileStorage('https://storage.example.com');
const file = {
  name: 'hello.pdf',
  type: 'application/pdf',
  data: new Uint8Array([1, 2, 3]),
};
it('надсилає multipart із назвою типом і байтами', async () => {
  server.use(
    http.post(UPLOAD_URL, async ({ request }) => {
      const form = await request.formData();
      const saved = form.get('file') as File;
      expect(saved.name).toBe('hello.pdf');
      expect(saved.type).toBe('application/pdf');
      expect([...new Uint8Array(await saved.arrayBuffer())]).toEqual([1, 2, 3]);
      return HttpResponse.json({
        id: 'F-2',
        url: 'https://storage.example.com/F-2',
      });
    }),
  );
  await expect(storage.upload(file)).resolves.toEqual({
    id: 'F-2',
    url: 'https://storage.example.com/F-2',
  });
});
it.each([400, 413, 503])('відхиляє HTTP %i', async (status) => {
  server.use(http.post(UPLOAD_URL, () => new HttpResponse(null, { status })));
  await expect(storage.upload(file)).rejects.toThrow('UPLOAD_UNAVAILABLE');
});
it.each([
  null,
  [],
  {},
  { id: 1, url: 'x' },
  { id: '', url: 'x' },
  { id: 'x' },
  { id: 'x', url: 1 },
  { id: 'x', url: '' },
])('відхиляє формат %j', async (data) => {
  server.use(http.post(UPLOAD_URL, () => HttpResponse.json(data)));
  await expect(storage.upload(file)).rejects.toThrow('INVALID_UPLOAD_FORMAT');
});
it('відхиляє не JSON', async () => {
  server.use(http.post(UPLOAD_URL, () => new HttpResponse('broken')));
  await expect(storage.upload(file)).rejects.toThrow('INVALID_UPLOAD_FORMAT');
});
it('передає мережевий збій', async () => {
  server.use(http.post(UPLOAD_URL, () => HttpResponse.error()));
  await expect(storage.upload(file)).rejects.toThrow();
});
it('поєднує сервіс HTTP-клієнт і журнал', async () => {
  const journal = new InMemoryJournal();
  const service = new UploadService(storage, journal, {
    now: () => new Date('2026-11-03T10:00:00Z'),
  });
  await service.upload(file);
  expect(journal.entries[0].id).toBe('F-1');
  expect(journal.entries).toHaveLength(1);
});
