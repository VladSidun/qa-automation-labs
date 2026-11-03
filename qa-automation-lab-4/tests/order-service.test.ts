import type { Mock } from 'vitest';
import type { RateProvider, Notifier } from '../src/order-service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderService } from '../src/order-service';
import { InMemoryOrderRepository } from './fakes/in-memory-repository';
describe('OrderService', () => {
  const now = '2026-03-15T10:00:00.000Z';
  let repo: InMemoryOrderRepository;
  let rates: { getRate: Mock<RateProvider['getRate']> };
  let notifier: { send: Mock<Notifier['send']> };
  let service: OrderService;
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(now));
    repo = new InMemoryOrderRepository();
    rates = { getRate: vi.fn().mockResolvedValue(41) };
    notifier = { send: vi.fn().mockResolvedValue(undefined) };
    service = new OrderService(rates, repo, notifier);
  });
  it('конвертує суму та зберігає стан і дату', async () => {
    const record = await service.placeOrder({
      id: 'A-1',
      amountUsd: 100,
      email: 'u@e.com',
    });
    expect(record.amountUah).toBeCloseTo(4100, 2);
    expect(record.createdAt).toBe(now);
    expect(await repo.findById('A-1')).toEqual(record);
    expect(repo.size).toBe(1);
  });
  it('надсилає лист з отриманою сумою', async () => {
    await service.placeOrder({ id: 'A-2', amountUsd: 10, email: 'u@e.com' });
    expect(notifier.send).toHaveBeenCalledExactlyOnceWith(
      'u@e.com',
      'Замовлення A-2 на суму 410 грн прийнято',
    );
  });
  it.each([0, -1])(
    'відхиляє суму %s до виклику залежностей',
    async (amountUsd) => {
      await expect(
        service.placeOrder({ id: 'A', amountUsd, email: 'x' }),
      ).rejects.toThrow('INVALID_AMOUNT');
      expect(rates.getRate).not.toHaveBeenCalled();
      expect(repo.size).toBe(0);
      expect(notifier.send).not.toHaveBeenCalled();
    },
  );
  it('за відмови курсу не зберігає і не надсилає', async () => {
    rates.getRate.mockRejectedValue(new Error('RATE_UNAVAILABLE'));
    await expect(
      service.placeOrder({ id: 'A', amountUsd: 1, email: 'x' }),
    ).rejects.toThrow('RATE_UNAVAILABLE');
    expect(repo.size).toBe(0);
    expect(notifier.send).not.toHaveBeenCalled();
  });
  it('не надсилає лист за відмови сховища', async () => {
    vi.spyOn(repo, 'save').mockRejectedValue(new Error('SAVE_FAILED'));
    await expect(
      service.placeOrder({ id: 'A', amountUsd: 1, email: 'x' }),
    ).rejects.toThrow('SAVE_FAILED');
    expect(notifier.send).not.toHaveBeenCalled();
  });
  it('передає відмову листа після збереження', async () => {
    notifier.send.mockRejectedValue(new Error('MAIL_FAILED'));
    await expect(
      service.placeOrder({ id: 'A', amountUsd: 1, email: 'x' }),
    ).rejects.toThrow('MAIL_FAILED');
    expect(repo.size).toBe(1);
  });
});
