import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CartRepository } from '../cart/cart.repository';
import { ListingsRepository } from '../listings/listings.repository';
import { asyncHandler } from '../../core/middleware/errorHandler';
import { requireAuth } from '../../core/middleware/auth';

const prisma = new PrismaClient();
const controller = new OrdersController(
  new OrdersService(new OrdersRepository(prisma), new CartRepository(prisma), new ListingsRepository(prisma)),
);

export const ordersRouter = Router();
ordersRouter.use(requireAuth);

/**
 * @openapi
 * /orders/checkout:
 *   post:
 *     summary: Check out the current cart into a confirmed order (atomic - all or nothing)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Order created, cart cleared }
 *       400: { description: Cart is empty, or a cart item is no longer available }
 */
ordersRouter.post('/checkout', asyncHandler(controller.checkout));

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: List the current user's orders, paginated
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 50 }
 *     responses:
 *       200: { description: A page of orders }
 */
ordersRouter.get('/', asyncHandler(controller.list));

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Get a single order (only if it belongs to the current user)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: The order with its items }
 *       404: { description: Not found }
 */
ordersRouter.get('/:id', asyncHandler(controller.getOne));
