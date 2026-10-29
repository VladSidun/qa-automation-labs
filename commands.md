## Лабораторна 1

- `npm test` - прогін усіх тестів.
- `npm test -- tests/average.test.ts` - тести середнього арифметичного.
- `npm run test:watch -- --watch tests/average.test.ts` - автоматичний перезапуск тестів після збереження файлу;
- `npm run coverage` - прогін тестів і створення звіту покриття.
- `Invoke-Item .\coverage\index.html` - відкрити звіт покриття в браузері.
- `npm run lint` - перевірка коду лінтером.
- `npm run typecheck` - перевірка типів TypeScript.

## Лабораторна 2

- `npm test` - прогін усіх тестів.
- `npm test -- tests/order.test.ts` - тести модуля замовлення.
- `npm test -- tests/installment.test.ts` - тести розстрочки, варіант 12.
- `npm run coverage` - прогін тестів і створення звіту покриття.
- `Invoke-Item .\coverage\index.html` - відкрити звіт покриття в браузері.
- `npm run lint` - перевірка коду лінтером.
- `npm run typecheck` - перевірка типів TypeScript.

## Лабораторна 3

Виконувати в папці `qa-automation-lab-3`.

- `npm test` - прогін усіх тестів.
- `npm test -- tests/parking.test.ts` - тести паркування.
- `npm test -- tests/insurance.test.ts` - тести страховки, варіант 12.
- `npm run test:watch -- --watch tests/insurance.test.ts` - перезапуск тестів після збереження.
- `npm run coverage` - тести та звіт покриття.
- `Invoke-Item .\coverage\index.html` - відкрити звіт у браузері.
- `npm run lint` - перевірка коду лінтером.
- `npm run typecheck` - перевірка типів TypeScript.
- `git log --oneline --reverse lab-2..lab-3` - історія кроків TDD.
