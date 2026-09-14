import type { PrismaClient } from '@prisma/client';

export interface CheckoutLine {
  listingId: string;
  quantity: number;
  unitPriceCents: number;
}

export class OrdersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Everything here happens in one transaction: create the order, create
   * every order item, clear the cart rows that were just purchased. If
   * anything throws (including the isActive re-check the caller does
   * beforehand having gone stale), Prisma rolls the whole thing back - the
   * user never ends up with an order but a non-empty cart, or vice versa.
   */
  checkout(userId: string, lines: CheckoutLine[], totalCents: number, currency: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          buyerId: userId,
          totalCents,
          currency,
          status: 'CONFIRMED',
          items: {
            create: lines.map((line) => ({
              listingId: line.listingId,
              quantity: line.quantity,
              unitPriceCents: line.unitPriceCents,
            })),
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({
        where: { userId, listingId: { in: lines.map((l) => l.listingId) } },
      });

      return order;
    });
  }

  findByIdForUser(orderId: string, userId: string) {
    return this.prisma.order.findFirst({
      where: { id: orderId, buyerId: userId },
      include: { items: { include: { listing: true } } },
    });
  }

  async listForUser(userId: string, cursor: string | null, limit: number) {
    const orders = await this.prisma.order.findMany({
      where: { buyerId: userId },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: { items: true },
    });
    const hasMore = orders.length > limit;
    const page = orders.slice(0, limit);
    return { items: page, nextCursor: hasMore && page.length > 0 ? page[page.length - 1]!.id : null };
  }
}
