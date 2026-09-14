import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Listing } from '../../domain/models/Listing';

/**
 * Non-sensitive, so plain AsyncStorage is fine here (unlike tokens).
 * This is the "cache last-seen listings, show cached data with a stale
 * banner when offline" strategy from the original plan - deliberately
 * lighter than the finance app's full outbox/sync engine, because a
 * marketplace's writes (orders) are riskier to silently queue offline
 * than a personal expense log's are.
 */
const CACHE_KEY = 'listings_cache_v1';

export interface CachedListingsPage {
  listings: Listing[];
  cachedAt: string;
}

export class ListingsCache {
  async save(listings: Listing[]): Promise<void> {
    const page: CachedListingsPage = { listings, cachedAt: new Date().toISOString() };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(page));
  }

  async load(): Promise<CachedListingsPage | null> {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CachedListingsPage) : null;
  }
}
