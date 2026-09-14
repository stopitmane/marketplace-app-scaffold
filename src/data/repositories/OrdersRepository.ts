import type { ApiClient } from '../network/ApiClient';
import type { Order } from '../../domain/models/Order';
import type { Page } from '../../domain/models/Listing';
import type { Result } from '../../core/types/Result';
import type { AppError } from '../../core/errors/AppError';

export interface IOrdersRepository {
  checkout(): Promise<Result<Order, AppError>>;
  getPage(cursor: string | null): Promise<Result<Page<Order>, AppError>>;
  getOne(id: string): Promise<Result<Order, AppError>>;
}

export class OrdersRepository implements IOrdersRepository {
  constructor(private readonly api: ApiClient) {}

  checkout(): Promise<Result<Order, AppError>> {
    return this.api.request<Order>('/orders/checkout', { method: 'POST' });
  }

  getPage(cursor: string | null): Promise<Result<Page<Order>, AppError>> {
    const query = cursor ? `?cursor=${cursor}` : '';
    return this.api.request<Page<Order>>(`/orders${query}`);
  }

  getOne(id: string): Promise<Result<Order, AppError>> {
    return this.api.request<Order>(`/orders/${id}`);
  }
}
