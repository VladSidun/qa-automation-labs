import { expect, it, vi } from 'vitest';
import { OrderService } from '../src/order-service';
import { InMemoryOrderRepository } from './fakes/in-memory-repository';
const input = { id: 'E-1', amountUsd: 50, email: 'u@e.com' };
function prepare() {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-03-15T10:00:00Z'));
  const repo = new InMemoryOrderRepository();
  const service = new OrderService(
    { getRate: vi.fn().mockResolvedValue(41) },
    repo,
    { send: vi.fn().mockResolvedValue(undefined) },
  );
  return { repo, service };
}
it('стан сховища містить фінальне замовлення', async () => {
  const { repo, service } = prepare();
  const record = await service.placeOrder(input);
  expect(await repo.findById('E-1')).toEqual(record);
  expect(repo.size).toBe(1);
});
it('взаємодія містить рівно один запис', async () => {
  const { repo, service } = prepare();
  const spy = vi.spyOn(repo, 'save');
  await service.placeOrder(input);
  expect(spy).toHaveBeenCalledTimes(1);
});
