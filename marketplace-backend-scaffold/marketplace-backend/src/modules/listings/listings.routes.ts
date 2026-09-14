import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ListingsRepository } from './listings.repository';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { asyncHandler } from '../../core/middleware/errorHandler';
import { requireAuth } from '../../core/middleware/auth';

const prisma = new PrismaClient();
const controller = new ListingsController(new ListingsService(new ListingsRepository(prisma)));

export const listingsRouter = Router();

/**
 * @openapi
 * /listings:
 *   get:
 *     summary: Browse listings with search, filters, and cursor pagination
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Free-text search on title
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: integer }
 *         description: Max price in cents
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *         description: Opaque cursor (a listing id) from a previous page's nextCursor
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 50 }
 *     responses:
 *       200: { description: A page of listings }
 *   post:
 *     summary: Create a listing (requires auth)
 *     tags: [Listings]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Listing created }
 *       401: { description: Not authenticated }
 */
listingsRouter.get('/', asyncHandler(controller.browse));
listingsRouter.post('/', requireAuth, asyncHandler(controller.create));

/**
 * @openapi
 * /listings/{id}:
 *   get:
 *     summary: Get a single listing
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: The listing }
 *       404: { description: Not found }
 */
listingsRouter.get('/:id', asyncHandler(controller.getOne));
