# Автоматизація тестування

Лабораторні роботи 1 та 2. Варіант 12. TypeScript і Vitest.

Роботи оформлено в окремих гілках із послідовними комітами:

- [Лабораторна 1 — середнє арифметичне](https://github.com/VladSidun/qa-automation-labs/tree/lab-1/qa-automation-lab-1).
- [Лабораторна 2 — замовлення та розстрочка](https://github.com/VladSidun/qa-automation-labs/tree/lab-2/qa-automation-lab-2).
- [Команди для демонстрації обох робіт](https://github.com/VladSidun/qa-automation-labs/blob/lab-2/commands.md).

Гілка `lab-2` містить обидві лабораторні. Запит для `lab-1` спрямований
у `main`, запит для `lab-2` — у `lab-1`.

## Встановлення та запуск

Потрібні Node.js 24, npm і Git.

```powershell
git clone --branch lab-2 https://github.com/VladSidun/qa-automation-labs.git
Set-Location -LiteralPath '.\qa-automation-labs'
$labsRoot = (Get-Location).Path

# Перша лабораторна.
Set-Location -LiteralPath (Join-Path $labsRoot 'qa-automation-lab-1')
npm ci
npm test
npm run coverage
npm run lint
npm run typecheck

# Друга лабораторна.
Set-Location -LiteralPath (Join-Path $labsRoot 'qa-automation-lab-2')
npm ci
npm test
npm run coverage
npm run lint
npm run typecheck
```

HTML-звіт формується в `coverage/index.html` кожної роботи. Залежності
встановлюються за `package-lock.json`; `node_modules` і результати покриття
не зберігаються в Git.

## Завдання варіанта 12

У першій роботі `calcAverage` обчислює середнє масиву чисел та відхиляє
порожній масив. Додатково перевіряються `NaN` і нескінченності.

У другій роботі `calcInstallment` повертає місячний платіж для 3, 6 або
12 місяців. Надбавка до початкової суми становить 2 %, 4 % або 8 % відповідно.
Результат округлюється до копійок; інші строки й некоректна сума відхиляються.

Перша робота містить 15 тестів, друга — 76, включно з тестами першої роботи.
В обох наборах покриття рядків, гілок, функцій та інструкцій становить 100 %.

## Лабораторна 3

[Гілка lab-3](https://github.com/VladSidun/qa-automation-labs/tree/lab-3)
продовжує lab-2 і містить практикум TDD: паркування та страховку за варіантом 12.
Код, специфікація й інструкція запуску — у `qa-automation-lab-3`.
Історія містить окремі Red, Green і Refactor-кроки; конспект 20/80 — у `THEORY.md`.
