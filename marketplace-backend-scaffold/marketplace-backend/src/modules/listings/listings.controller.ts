import type { Request, Response } from 'express';
import type { ListingsService } from './listings.service';

export class ListingsController {
  constructor(private readonly service: ListingsService) {}

  browse = async (req: Request, res: Response) => {
    const { category, q, maxPrice, cursor, limit } = req.query;
    const page = await this.service.browse(
      {
        category: category as string | undefined,
        searchQuery: q as string | undefined,
        maxPriceCents: maxPrice ? Number(maxPrice) : undefined,
      },
      (cursor as string) ?? null,
      limit ? Number(limit) : undefined,
    );
    res.status(200).json(page);
  };

  getOne = async (req: Request, res: Response) => {
    const listing = await this.service.getOne(req.params.id!);
    res.status(200).json(listing);
  };

  create = async (req: Request, res: Response) => {
    // req.userId is set by requireAuth middleware
    const listing = await this.service.create(req.userId!, req.body);
    res.status(201).json(listing);
  };
}
