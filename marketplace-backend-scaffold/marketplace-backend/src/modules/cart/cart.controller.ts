import type { Request, Response } from 'express';
import type { CartService } from './cart.service';

export class CartController {
  constructor(private readonly service: CartService) {}

  getCart = async (req: Request, res: Response) => {
    const cart = await this.service.getCart(req.userId!);
    res.status(200).json(cart);
  };

  addItem = async (req: Request, res: Response) => {
    const { listingId, quantity } = req.body;
    await this.service.addItem(req.userId!, listingId, quantity ?? 1);
    res.status(201).json(await this.service.getCart(req.userId!));
  };

  updateItem = async (req: Request, res: Response) => {
    const { quantity } = req.body;
    // Non-null assertion matches req.userId! above: this route is only ever
    // reached as /cart/items/:id, so Express guarantees the param exists -
    // noUncheckedIndexedAccess just can't see that from the route pattern.
    await this.service.updateItem(req.userId!, req.params.id!, quantity);
    res.status(200).json(await this.service.getCart(req.userId!));
  };

  removeItem = async (req: Request, res: Response) => {
    await this.service.removeItem(req.userId!, req.params.id!);
    res.status(204).send();
  };
}
