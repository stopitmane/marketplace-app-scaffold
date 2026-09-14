import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { requestId } from './core/middleware/requestId';
import { errorHandler } from './core/middleware/errorHandler';
import { authRouter } from './modules/auth/auth.routes';
import { listingsRouter } from './modules/listings/listings.routes';
import { cartRouter } from './modules/cart/cart.routes';
import { ordersRouter } from './modules/orders/orders.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(requestId);

  // Generous but real limit - protects against brute-force on /auth without
  // getting in the way of normal browsing traffic on /listings.
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

  const openapiSpec = swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: { title: 'Marketplace API', version: '0.1.0' },
      components: {
        securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      },
    },
    apis: ['./src/modules/**/*.routes.ts'],
  });
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  app.use('/auth', authRouter);
  app.use('/listings', listingsRouter);
  app.use('/cart', cartRouter);
  app.use('/orders', ordersRouter);

  // Must be registered last - Express matches error-handling middleware by
  // its 4-argument signature, so ordering here is not cosmetic.
  app.use(errorHandler);

  return app;
}
