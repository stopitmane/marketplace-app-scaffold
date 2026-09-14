import type { LinkingOptions } from '@react-navigation/native';

/**
 * Maps marketplace://listing/abc123 and https://yourapp.com/listing/abc123
 * to the ListingDetail screen. Add the associated-domains / assetlinks.json
 * config on your app's native side for the https:// universal link to work
 * on-device - the JS-side config alone only covers the custom scheme.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const linking: LinkingOptions<any> = {
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
