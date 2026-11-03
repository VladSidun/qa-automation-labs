import { createApp } from './app';
const port = Number(process.env.PORT ?? 3000);
createApp().listen(port, '127.0.0.1', () =>
  process.stdout.write(`http://127.0.0.1:${port}\n`),
);
