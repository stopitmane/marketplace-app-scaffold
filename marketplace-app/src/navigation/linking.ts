import type { LinkingOptions } from '@react-navigation/native';

export type RootStackParamList = {
  Listings: undefined;
  ListingDetail: { id: string };
  Cart: undefined;
  Orders: undefined;
  OrderDetail: { id: string };
  Login: undefined;
};

/**
 * Maps marketplace://listing/abc123 and https://yourapp.com/listing/abc123
 * to the ListingDetail screen. Add the associated-domains / assetlinks.json
 * config on your app's native side for the https:// universal link to work
 * on-device - the JS-side config alone only covers the custom scheme.
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['marketplace://', 'https://yourapp.com'],
  config: {
    screens: {
      Listings: 'listings',
      ListingDetail: 'listing/:id',
      Cart: 'cart',
      Orders: 'orders',
      OrderDetail: 'order/:id',
      Login: 'login',
    },
  },
};
