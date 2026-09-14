import type { Request, Response } from 'express';
import type { OrdersService } from './orders.service';

export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  checkout = async (req: Request, res: Response) => {
    const order = await this.service.checkout(req.userId!);
    res.status(201).json(order);
  };

  list = async (req: Request, res: Response) => {
    const { cursor, limit } = req.query;
    const page = await this.service.listOrders(req.userId!, (cursor as string) ?? null, limit ? Number(limit) : undefined);
    res.status(200).json(page);
  };

  getOne = async (req: Request, res: Response) => {
    const order = await this.service.getOrder(req.userId!, req.params.id!);
    res.status(200).json(order);
  };
}
