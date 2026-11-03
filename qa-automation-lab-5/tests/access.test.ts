import { beforeEach, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { login, payload } from './helpers';
import { expectSchema } from './schema';
import { orderSchema } from './schemas/order.schema';
let app: ReturnType<typeof createApp>;
let client: ReturnType<typeof request>;
beforeEach(() => {
  app = createApp();
  client = request(app);
});
it.each([
  {},
  { email: 'unknown@example.com', password: 'Secret123' },
  { email: 'bob@example.com', password: 'wrong' },
])('відхиляє хибний вхід %j', async (body) => {
  const res = await request(app).post('/auth/login').send(body);
  expect(res.status).toBe(401);
  expect(res.body).toEqual({ code: 'INVALID_CREDENTIALS' });
});
it.each(['get', 'post', 'delete'] as const)(
  'блокує %s без токена',
  async (method) => {
    const url = method === 'delete' ? '/orders/missing' : '/orders';
    const res = await client[method](url).send(payload());
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  },
);
it.each([
  'Bearer invalid-token',
  'some-token',
  'Basic invalid-token',
  'Bearer  invalid-token',
])('відхиляє заголовок %s', async (header) => {
  expect(
    (await request(app).get('/orders').set('Authorization', header)).status,
  ).toBe(401);
});
it('не приймає справжній токен без Bearer', async () => {
  const token = await login(app);
  expect(
    (await request(app).get('/orders').set('Authorization', token)).status,
  ).toBe(401);
});
it.each(['get', 'delete'] as const)(
  '%s не відкриває чуже замовлення',
  async (method) => {
    const alice = await login(app, 'alice@example.com');
    const bob = await login(app);
    const created = await request(app)
      .post('/orders')
      .auth(alice, { type: 'bearer' })
      .send(payload());
    const res = await client[method](created.headers.location).auth(bob, {
      type: 'bearer',
    });
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
    expect(
      (
        await request(app)
          .get(created.headers.location)
          .auth(alice, { type: 'bearer' })
      ).status,
    ).toBe(200);
  },
);
it('список містить лише власне замовлення і відповідає схемі', async () => {
  const alice = await login(app, 'alice@example.com');
  const bob = await login(app);
  await request(app)
    .post('/orders')
    .auth(alice, { type: 'bearer' })
    .send(payload());
  const own = await request(app)
    .post('/orders')
    .auth(bob, { type: 'bearer' })
    .send(payload('XYZ-9999'));
  const list = await request(app).get('/orders').auth(bob, { type: 'bearer' });
  expect(list.status).toBe(200);
  expect(list.body).toEqual([own.body]);
  expectSchema(list.body, { type: 'array', items: orderSchema });
});
it.each(['get', 'delete'] as const)(
  '%s відсутнього ресурсу повертає 404',
  async (method) => {
    const token = await login(app);
    expect(
      (await client[method]('/orders/missing').auth(token, { type: 'bearer' }))
        .status,
    ).toBe(404);
  },
);
