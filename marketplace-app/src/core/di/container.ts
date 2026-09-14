type Factory<T> = () => T;

class Container {
  private factories = new Map<string, Factory<unknown>>();
  private singletons = new Map<string, unknown>();

  register<T>(key: string, factory: Factory<T>): void {
    this.factories.set(key, factory);
    this.singletons.delete(key);
  }

  resolve<T>(key: string): T {
    if (this.singletons.has(key)) return this.singletons.get(key) as T;
    const factory = this.factories.get(key);
    if (!factory) throw new Error(`No factory registered for "${key}"`);
    const instance = factory();
    this.singletons.set(key, instance);
    return instance as T;
  }

  reset(): void {
    this.factories.clear();
    this.singletons.clear();
  }
}

export const container = new Container();

export const Tokens = {
  ApiClient: 'apiClient',
  Logger: 'logger',
  TokenStorage: 'tokenStorage',
  AuthRepository: 'authRepository',
  ListingsRepository: 'listingsRepository',
  CartRepository: 'cartRepository',
  OrdersRepository: 'ordersRepository',
  FavouritesRepository: 'favouritesRepository',
} as const;
