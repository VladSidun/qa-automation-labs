import express from 'express';
import { randomUUID } from 'node:crypto';
type Tier = 'basic' | 'silver' | 'gold';
interface Item {
  sku: string;
  price: number;
  qty: number;
}
interface Order {
  id: string;
  ownerId: string;
  tier: Tier;
  items: Item[];
  subtotal: number;
  total: number;
  createdAt: string;
}
const USERS = [
  {
    id: 'u1',
    email: 'alice@example.com',
    password: 'Secret123',
    tier: 'gold' as Tier,
  },
  {
    id: 'u2',
    email: 'bob@example.com',
    password: 'Secret123',
    tier: 'basic' as Tier,
  },
];
const DISCOUNT: Record<Tier, number> = { basic: 0, silver: 0.05, gold: 0.1 };
const round2 = (n: number) => Math.round(n * 100) / 100;
const SKU_PATTERN = /^[A-Z]{3}-[0-9]{4}$/;
function toPublic(order: Order) {
  return {
    id: order.id,
    tier: order.tier,
    items: order.items,
    subtotal: order.subtotal,
    total: order.total,
    createdAt: order.createdAt,
  };
}
export function createApp() {
  const app = express();
  app.use(express.json());
  const tokens = new Map<string, string>();
  const orders = new Map<string, Order>();
  app.post('/auth/login', (req, res) => {
    const user = USERS.find(
      (u) => u.email === req.body?.email && u.password === req.body?.password,
    );
    if (!user) return res.status(401).json({ code: 'INVALID_CREDENTIALS' });
    const token = randomUUID();
    tokens.set(token, user.id);
    res.json({ accessToken: token });
  });
  app.use('/orders', (req, res, next) => {
    const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization ?? '');
    const userId = match ? tokens.get(match[1]) : undefined;
    if (!userId) return res.status(401).json({ code: 'UNAUTHORIZED' });
    res.locals.user = USERS.find((u) => u.id === userId);
    next();
  });
  app.post('/orders', (req, res) => {
    const items: Item[] = req.body?.items;
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ code: 'EMPTY_ORDER' });
    for (const i of items) {
      if (typeof i !== 'object' || i === null || Array.isArray(i))
        return res.status(400).json({ code: 'INVALID_ITEM' });
      // Довжина також відсіює кінцевий перенос рядка.
      if (
        typeof i.sku !== 'string' ||
        i.sku.length !== 8 ||
        !SKU_PATTERN.test(i.sku)
      )
        return res.status(400).json({ code: 'INVALID_SKU' });
      if (
        typeof i.price !== 'number' ||
        !Number.isFinite(i.price) ||
        i.price < 0
      )
        return res.status(400).json({ code: 'INVALID_PRICE' });
      if (!Number.isInteger(i.qty) || i.qty <= 0)
        return res.status(400).json({ code: 'INVALID_QTY' });
    }
    const user = res.locals.user;
    const subtotal = round2(items.reduce((s, i) => s + i.price * i.qty, 0));
    let rate = DISCOUNT[user.tier as Tier];
    if (subtotal >= 2000) rate += 0.05;
    const afterDiscount = round2(subtotal * (1 - Math.min(rate, 0.25)));
    const total = round2(afterDiscount + (afterDiscount >= 1000 ? 0 : 60));
    const order: Order = {
      id: randomUUID(),
      ownerId: user.id,
      tier: user.tier,
      items: items.map((i) => ({ sku: i.sku, price: i.price, qty: i.qty })),
      subtotal,
      total,
      createdAt: new Date().toISOString(),
    };
    orders.set(order.id, order);
    res.status(201).location(`/orders/${order.id}`).json(toPublic(order));
  });
  app.get('/orders', (_req, res) => {
    const mine = [...orders.values()].filter(
      (o) => o.ownerId === res.locals.user.id,
    );
    res.json(mine.map(toPublic));
  });
  app.get('/orders/:id', (req, res) => {
    const order = orders.get(req.params.id);
    if (!order || order.ownerId !== res.locals.user.id)
      return res.status(404).json({ code: 'NOT_FOUND' });
    res.json(toPublic(order));
  });
  app.delete('/orders/:id', (req, res) => {
    const order = orders.get(req.params.id);
    if (!order || order.ownerId !== res.locals.user.id)
      return res.status(404).json({ code: 'NOT_FOUND' });
    orders.delete(order.id);
    res.status(204).end();
  });
  return app;
}
