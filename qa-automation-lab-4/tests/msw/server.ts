import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
export const RATE_URL = 'https://api.example.com/rate';
export const UPLOAD_URL = 'https://storage.example.com/files';
export const server = setupServer(
  http.get(RATE_URL, () => HttpResponse.json({ rate: 41.25 })),
  http.post(UPLOAD_URL, () =>
    HttpResponse.json(
      { id: 'F-1', url: 'https://storage.example.com/F-1' },
      { status: 201 },
    ),
  ),
);
