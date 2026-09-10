import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { container, Tokens } from './core/di/container';
import { ConsoleLogger } from './core/logger/Logger';
import { SecureTokenStorage } from './data/local/TokenStorage';
import { ListingsCache } from './data/local/ListingsCache';
import { ApiClient } from './data/network/ApiClient';
import { AuthRepository } from './data/repositories/AuthRepository';
import { ListingsRepository } from './data/repositories/ListingsRepository';
import { CartRepository } from './data/repositories/CartRepository';
import { OrdersRepository } from './data/repositories/OrdersRepository';
import { LocalFavouritesRepository } from './data/repositories/FavouritesRepository';
import { ListingsScreen } from './presentation/screens/ListingsScreen';
import { CartScreen } from './presentation/screens/CartScreen';
import { linking } from './navigation/linking';

/**
 * All wiring happens once, here - not scattered across screens with
 * ad-hoc `new Repository(...)` calls. Swap any registration in a test
 * setup file to inject fakes app-wide.
 */
function registerDependencies() {
  container.register(Tokens.Logger, () => new ConsoleLogger());
  container.register(Tokens.TokenStorage, () => new SecureTokenStorage());
  container.register(Tokens.ApiClient, () => new ApiClient(container.resolve(Tokens.Logger), container.resolve(Tokens.TokenStorage)));

  container.register(Tokens.AuthRepository, () => new AuthRepository(container.resolve(Tokens.ApiClient), container.resolve(Tokens.TokenStorage)));
  container.register(
    Tokens.ListingsRepository,
    () => new ListingsRepository(container.resolve(Tokens.ApiClient), new ListingsCache(), container.resolve(Tokens.Logger)),
  );
  container.register(Tokens.CartRepository, () => new CartRepository(container.resolve(Tokens.ApiClient)));
  container.register(Tokens.OrdersRepository, () => new OrdersRepository(container.resolve(Tokens.ApiClient)));
  container.register(Tokens.FavouritesRepository, () => new LocalFavouritesRepository());
}

registerDependencies();

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Listings" options={{ title: 'Marketplace' }}>
          {({ navigation }) => <ListingsScreen onSelectListing={(id) => navigation.navigate('ListingDetail', { id })} />}
        </Stack.Screen>
        <Stack.Screen name="Cart">
          {({ navigation }) => <CartScreen onCheckout={() => navigation.navigate('Checkout')} />}
        </Stack.Screen>
        {/* ListingDetail, Checkout, Orders, OrderDetail, Login screens follow
            the exact same shape as Listings/Cart above - build them by
            copying this pattern, not inventing a new one. */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
