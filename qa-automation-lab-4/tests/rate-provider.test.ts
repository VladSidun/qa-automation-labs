import { expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { HttpRateProvider } from '../src/rate-provider';
import { server, RATE_URL } from './msw/server';
const provider = new HttpRateProvider('https://api.example.com');
it('повертає курс і передає валюти в URL', async () => {
  server.use(
    http.get(RATE_URL, ({ request }) => {
      const url = new URL(request.url);
      expect(url.searchParams.get('from')).toBe('EUR');
      expect(url.searchParams.get('to')).toBe('PLN');
      return HttpResponse.json({ rate: 41.25 });
    }),
  );
  await expect(provider.getRate('EUR', 'PLN')).resolves.toBe(41.25);
});
it('відхиляє статус 503', async () => {
  server.use(http.get(RATE_URL, () => new HttpResponse(null, { status: 503 })));
  await expect(provider.getRate('USD', 'UAH')).rejects.toThrow(
    'RATE_UNAVAILABLE',
  );
});
it('відхиляє рядок замість числа', async () => {
  server.use(http.get(RATE_URL, () => HttpResponse.json({ rate: '41.25' })));
  await expect(provider.getRate('USD', 'UAH')).rejects.toThrow(
    'INVALID_RATE_FORMAT',
  );
});
it('передає мережевий збій', async () => {
  server.use(http.get(RATE_URL, () => HttpResponse.error()));
  await expect(provider.getRate('USD', 'UAH')).rejects.toThrow();
});
