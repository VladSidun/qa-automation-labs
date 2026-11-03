import { beforeEach, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { login, payload } from './helpers';
import { expectSchema } from './schema';
import { orderSchema, errorSchema } from './schemas/order.schema';
let app: ReturnType<typeof createApp>;
let token: string;
beforeEach(async () => {
  app = createApp();
  token = await login(app);
});
it.each(['ABC-1234', 'AAA-0000', 'ZZZ-9999', 'XYZ-0001'])(
  'приймає sku %s на всіх п’яти рівнях',
  async (sku) => {
    const res = await request(app)
      .post('/orders')
      .auth(token, { type: 'bearer' })
      .send(payload(sku));
    expect(res.status).toBe(201);
    expectSchema(res.body, orderSchema);
    expect(res.body.items[0].sku).toBe(sku);
    expect(res.body.total).toBeCloseTo(560, 2);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.headers.location).toBe(`/orders/${res.body.id}`);
    const saved = await request(app)
      .get(res.headers.location)
      .auth(token, { type: 'bearer' });
    expect(saved.status).toBe(200);
    expect(saved.body.items[0].sku).toBe(sku);
  },
);
it.each([
  'AB-1234',
  'ABCD-1234',
  'ABC-123',
  'ABC-12345',
  'abc-1234',
  'AbC-1234',
  'АБВ-1234',
  'ABC_1234',
  'ABC-12A4',
  ' ABC-1234',
  'ABC-1234 ',
  'ABC-1234\n',
  '',
  null,
  1234,
])('відхиляє sku %j без побічного ефекту', async (sku) => {
  const res = await request(app)
    .post('/orders')
    .auth(token, { type: 'bearer' })
    .send(payload(sku));
  expect(res.status).toBe(400);
  expectSchema(res.body, errorSchema);
  expect(res.body.code).toBe('INVALID_SKU');
  expect(
    (await request(app).get('/orders').auth(token, { type: 'bearer' })).body,
  ).toEqual([]);
});
it('відхиляє позицію без sku', async () => {
  const res = await request(app)
    .post('/orders')
    .auth(token, { type: 'bearer' })
    .send({ items: [{ price: 1, qty: 1 }] });
  expect(res.status).toBe(400);
  expect(res.body.code).toBe('INVALID_SKU');
});
it('не зберігає частину замовлення з некоректною другою позицією', async () => {
  const res = await request(app)
    .post('/orders')
    .auth(token, { type: 'bearer' })
    .send({ items: [...payload().items, ...payload('bad').items] });
  expect(res.status).toBe(400);
  expect(
    (await request(app).get('/orders').auth(token, { type: 'bearer' })).body,
  ).toEqual([]);
});
