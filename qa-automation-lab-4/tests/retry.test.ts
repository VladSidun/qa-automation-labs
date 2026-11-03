import { expect, it, vi } from 'vitest';
import { withRetry } from '../src/retry';
it('повертає перший успіх без очікування', async () => {
  vi.useFakeTimers();
  const action = vi.fn().mockResolvedValue('ok');
  await expect(withRetry(action)).resolves.toBe('ok');
  expect(action).toHaveBeenCalledTimes(1);
});
it('повторює після затримки і зупиняється після успіху', async () => {
  vi.useFakeTimers();
  const action = vi
    .fn()
    .mockRejectedValueOnce(new Error('TIMEOUT'))
    .mockResolvedValue('ok');
  const result = withRetry(action, 3, 1000);
  await vi.advanceTimersByTimeAsync(999);
  expect(action).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1);
  await expect(result).resolves.toBe('ok');
  expect(action).toHaveBeenCalledTimes(2);
});
it('повертає останню помилку після трьох спроб', async () => {
  vi.useFakeTimers();
  const last = new Error('LAST');
  const action = vi
    .fn()
    .mockRejectedValueOnce(new Error('FIRST'))
    .mockRejectedValue(last);
  const result = withRetry(action, 3, 1000);
  const assertion = expect(result).rejects.toBe(last);
  await vi.advanceTimersByTimeAsync(2000);
  await assertion;
  expect(action).toHaveBeenCalledTimes(3);
});
