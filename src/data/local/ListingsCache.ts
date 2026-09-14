import type { Listing } from '../../domain/models/Listing';

/**
 * Non-sensitive, so plain AsyncStorage is fine here (unlike tokens).
 * This is the "cache last-seen listings, show cached data with a stale
 * banner when offline" strategy from the original plan - deliberately
 * lighter than the finance app's full outbox/sync engine, because a
 * marketplace's writes (orders) are riskier to silently queue offline
 * than a personal expense log's are.
 */
export interface CachedListingsPage {
  listings: Listing[];
  cachedAt: string;
}

export class ListingsCache {
  async save(listings: Listing[]): Promise<void> {
    // import AsyncStorage from '@react-native-async-storage/async-storage';
    // const CACHE_KEY = 'listings_cache_v1';
    // await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ listings, cachedAt: new Date().toISOString() }));
    void listings; // suppress unused warning for now
    throw new Error('Wire up @react-native-async-storage/async-storage');
  }

  async load(): Promise<CachedListingsPage | null> {
    // const raw = await AsyncStorage.getItem(CACHE_KEY);
    // return raw ? JSON.parse(raw) : null;
    throw new Error('Wire up @react-native-async-storage/async-storage');
  }
}
