import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { login, payload } from './helpers';
import { expectSchema } from './schema';
import { orderSchema, errorSchema } from './schemas/order.schema';
describe('Замовлення та контракт API', () => {
  let app: ReturnType<typeof createApp>;
  let auth: { Authorization: string };
  beforeEach(async () => {
    app = createApp();
    auth = { Authorization: `Bearer ${await login(app)}` };
  });
  it('створює: 201, JSON, Location, сума і читання збереженого стану', async () => {
    const created = await request(app)
      .post('/orders')
      .set(auth)
      .send(payload());
    expect(created.status).toBe(201);
    expect(created.headers['content-type']).toMatch(/application\/json/);
    expect(created.headers.location).toBe(`/orders/${created.body.id}`);
    expect(created.body.total).toBeCloseTo(560, 2);
    expect(created.body.subtotal).toBe(500);
    const fetched = await request(app).get(created.headers.location).set(auth);
    expect(fetched.status).toBe(200);
    expect(fetched.body).toEqual(created.body);
  });
  it('відповідь POST відповідає JSON Schema', async () => {
    const res = await request(app).post('/orders').set(auth).send(payload());
    expect(res.status).toBe(201);
    expectSchema(res.body, orderSchema);
  });
  it.each([
    ['немає items', {}, 'EMPTY_ORDER'],
    ['не масив', { items: 'bad' }, 'EMPTY_ORDER'],
    ['порожній', { items: [] }, 'EMPTY_ORDER'],
    ['null позиція', { items: [null] }, 'INVALID_ITEM'],
    ['примітив', { items: [1] }, 'INVALID_ITEM'],
    ['масив позиції', { items: [[]] }, 'INVALID_ITEM'],
    ['ціна рядком', payload('ABC-1234', '10'), 'INVALID_PRICE'],
    ['ціна від’ємна', payload('ABC-1234', -1), 'INVALID_PRICE'],
    ['кількість 0', payload('ABC-1234', 10, 0), 'INVALID_QTY'],
    ['кількість -1', payload('ABC-1234', 10, -1), 'INVALID_QTY'],
    ['кількість дробова', payload('ABC-1234', 10, 1.5), 'INVALID_QTY'],
    ['кількість рядком', payload('ABC-1234', 10, '1'), 'INVALID_QTY'],
  ])('відхиляє %s без збереження', async (_name, body, code) => {
    const res = await request(app).post('/orders').set(auth).send(body);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe(code);
    expectSchema(res.body, errorSchema);
    const list = await request(app).get('/orders').set(auth);
    expect(list.body).toEqual([]);
  });
  it('відхиляє нескінченність після розбору JSON числа', async () => {
    const res = await request(app)
      .post('/orders')
      .set(auth)
      .set('Content-Type', 'application/json')
      .send('{"items":[{"sku":"ABC-1234","price":1e400,"qty":1}]}');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_PRICE');
  });
  it.each([
    [0, 60],
    [999, 1059],
    [1000, 1000],
    [1001, 1001],
    [1999, 1999],
    [2000, 1900],
    [2001, 1900.95],
  ])('basic: сума %s дає %s', async (price, expected) => {
    const res = await request(app)
      .post('/orders')
      .set(auth)
      .send(payload('ABC-1234', price));
    expect(res.status).toBe(201);
    expect(res.body.total).toBeCloseTo(expected, 2);
  });
  it('gold: доставка визначається після знижки', async () => {
    const token = await login(app, 'alice@example.com');
    const res = await request(app)
      .post('/orders')
      .auth(token, { type: 'bearer' })
      .send(payload('ABC-1234', 1050));
    expect(res.body.tier).toBe('gold');
    expect(res.body.total).toBeCloseTo(1005, 2);
  });
  it('ігнорує зовнішні службові поля та зберігає лише поля позиції', async () => {
    const res = await request(app)
      .post('/orders')
      .set(auth)
      .send({
        ownerId: 'u1',
        total: 1,
        items: [{ sku: 'ABC-1234', price: 500, qty: 1, secret: 'x' }],
      });
    expect(res.status).toBe(201);
    expect(res.body.total).toBe(560);
    expectSchema(res.body, orderSchema);
  });
  it('DELETE: 204 без тіла, повторний DELETE і GET повертають 404', async () => {
    const created = await request(app)
      .post('/orders')
      .set(auth)
      .send(payload());
    const url = created.headers.location;
    const first = await request(app).delete(url).set(auth);
    expect(first.status).toBe(204);
    expect(first.text).toBe('');
    expect((await request(app).delete(url).set(auth)).status).toBe(404);
    expect((await request(app).get(url).set(auth)).status).toBe(404);
    expect((await request(app).get('/orders').set(auth)).body).toEqual([]);
  });
  it('новий застосунок не успадковує токенів та замовлень', async () => {
    await request(app).post('/orders').set(auth).send(payload());
    const fresh = createApp();
    expect((await request(fresh).get('/orders').set(auth)).status).toBe(401);
    const token = await login(fresh);
    expect(
      (await request(fresh).get('/orders').auth(token, { type: 'bearer' }))
        .body,
    ).toEqual([]);
  });
});
