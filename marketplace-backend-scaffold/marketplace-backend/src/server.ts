import { createApp } from './app';
import { env } from './config/env';
import { logger } from './core/logger/Logger';

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Server listening on port ${env.PORT}`, { env: env.NODE_ENV });
  logger.info(`API docs at http://localhost:${env.PORT}/docs`);
});
