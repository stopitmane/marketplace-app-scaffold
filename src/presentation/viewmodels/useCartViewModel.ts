import { useCallback, useEffect, useState } from 'react';
import { container, Tokens } from '../../core/di/container';
import type { ICartRepository } from '../../data/repositories/CartRepository';
import type { Cart } from '../../domain/models/Order';
import type { AppError } from '../../core/errors/AppError';

type ViewState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; error: AppError }
  | { status: 'success'; cart: Cart };

export function useCartViewModel() {
  const [state, setState] = useState<ViewState>({ status: 'loading' });
  const cartRepo = container.resolve<ICartRepository>(Tokens.CartRepository);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    const result = await cartRepo.getCart();
    if (!result.ok) {
      setState({ status: 'error', error: result.error });
      return;
    }
    if (result.value.items.length === 0) {
      setState({ status: 'empty' });
      return;
    }
    setState({ status: 'success', cart: result.value });
  }, [cartRepo]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      const result = await cartRepo.updateItem(cartItemId, quantity);
      if (result.ok) {
        setState(result.value.items.length === 0 ? { status: 'empty' } : { status: 'success', cart: result.value });
      }
    },
    [cartRepo],
  );

  const removeItem = useCallback(
    async (cartItemId: string) => {
      await cartRepo.removeItem(cartItemId);
      void load();
    },
    [cartRepo, load],
  );

  return { state, retry: load, updateQuantity, removeItem };
}
