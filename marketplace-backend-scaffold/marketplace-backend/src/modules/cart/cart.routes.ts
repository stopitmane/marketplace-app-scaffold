import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { CartRepository } from './cart.repository';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ListingsRepository } from '../listings/listings.repository';
import { asyncHandler } from '../../core/middleware/errorHandler';
import { requireAuth } from '../../core/middleware/auth';

const prisma = new PrismaClient();
const controller = new CartController(new CartService(new CartRepository(prisma), new ListingsRepository(prisma)));

export const cartRouter = Router();
cartRouter.use(requireAuth);

/**
 * @openapi
 * /cart:
 *   get:
 *     summary: Get the current user's cart with line totals
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Cart items and total }
 */
cartRouter.get('/', asyncHandler(controller.getCart));

/**
 * @openapi
 * /cart/items:
 *   post:
 *     summary: Add a listing to the cart (upserts quantity if already present)
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [listingId]
 *             properties:
 *               listingId: { type: string }
 *               quantity: { type: integer, default: 1 }
 *     responses:
 *       201: { description: Updated cart }
 *       403: { description: Cannot add your own listing }
 *       404: { description: Listing not found or inactive }
 */
cartRouter.post('/items', asyncHandler(controller.addItem));

/**
 * @openapi
 * /cart/items/{id}:
 *   patch:
 *     summary: Update a cart item's quantity (deletes it if quantity <= 0)
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated cart }
 *       404: { description: Cart item not found }
 *   delete:
 *     summary: Remove a cart item
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Removed }
 *       404: { description: Cart item not found }
 */
cartRouter.patch('/items/:id', asyncHandler(controller.updateItem));
cartRouter.delete('/items/:id', asyncHandler(controller.removeItem));
