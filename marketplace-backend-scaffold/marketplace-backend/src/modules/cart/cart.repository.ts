import type { PrismaClient } from '@prisma/client';

export class CartRepository {
  constructor(private readonly prisma: PrismaClient) {}

  getItems(userId: string) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: { listing: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findItem(userId: string, cartItemId: string) {
    return this.prisma.cartItem.findFirst({ where: { id: cartItemId, userId }, include: { listing: true } });
  }

  /** Upsert on the (userId, listingId) unique constraint - adding an
   *  already-carted listing bumps its quantity rather than duplicating a row. */
  upsertItem(userId: string, listingId: string, quantity: number) {
    return this.prisma.cartItem.upsert({
      where: { userId_listingId: { userId, listingId } },
      create: { userId, listingId, quantity },
      update: { quantity: { increment: quantity } },
    });
  }

  updateQuantity(cartItemId: string, quantity: number) {
    return this.prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
  }

  deleteItem(cartItemId: string) {
    return this.prisma.cartItem.delete({ where: { id: cartItemId } });
  }

  clearForUser(userId: string) {
    return this.prisma.cartItem.deleteMany({ where: { userId } });
  }
}
