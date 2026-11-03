import request from 'supertest';
import type { Express } from 'express';
export async function login(
  app: Express,
  email = 'bob@example.com',
): Promise<string> {
  const res = await request(app)
    .post('/auth/login')
    .send({ email, password: 'Secret123' });
  if (res.status !== 200) throw new Error(`login failed: ${res.status}`);
  return res.body.accessToken;
}
export const payload = (
  sku: unknown = 'ABC-1234',
  price: unknown = 500,
  qty: unknown = 1,
) => ({ items: [{ sku, price, qty }] });
