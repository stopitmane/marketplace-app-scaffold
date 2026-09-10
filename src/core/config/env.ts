/**
 * Points at your marketplace-backend. Swap for a staging/production URL
 * via EXPO_PUBLIC_API_URL once this is deployed somewhere - Expo inlines
 * EXPO_PUBLIC_* env vars at build time, so no extra config library needed
 * for an app this size.
 */
export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000',
};
