import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { asyncHandler } from '../../core/middleware/errorHandler';

const prisma = new PrismaClient();
const controller = new AuthController(new AuthService(new AuthRepository(prisma)));

export const authRouter = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Create an account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string }
 *     responses:
 *       201: { description: Account created, tokens returned }
 *       409: { description: Email already registered }
 */
authRouter.post('/register', asyncHandler(controller.register));

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Tokens returned }
 *       401: { description: Invalid credentials }
 */
authRouter.post('/login', asyncHandler(controller.login));

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Exchange a refresh token for a new token pair
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: New token pair issued }
 *       401: { description: Refresh token invalid or expired }
 */
authRouter.post('/refresh', asyncHandler(controller.refresh));
