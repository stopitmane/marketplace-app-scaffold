import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Result } from '../../core/types/Result';
import type { AppError } from '../../core/errors/AppError';
import { ok } from '../../core/types/Result';

export interface IFavouritesRepository {
  toggle(listingId: string): Promise<Result<boolean, AppError>>; // returns new favourited state
  isFavourited(listingId: string): Promise<boolean>;
  getAllIds(): Promise<string[]>;
}

const STORAGE_KEY = 'favourite_ids';

/**
 * DELIBERATE SCOPE DECISION: favourites are local-only (AsyncStorage), not
 * synced to the backend. marketplace-backend has no /favourites endpoint -
 * this was a conscious call to keep the backend's scope to the "mobile ->
 * API -> database -> auth" literacy goal, not because syncing favourites is
 * hard. If you want cross-device favourites, add a FavouriteListing model
 * to the Prisma schema and a favourites module mirroring cart's shape -
 * the repository interface below wouldn't need to change, only this
 * implementation.
 */
export class LocalFavouritesRepository implements IFavouritesRepository {
  private async readIds(): Promise<Set<string>> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  }

  private async writeIds(ids: Set<string>): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  }

  async toggle(listingId: string): Promise<Result<boolean, AppError>> {
    const ids = await this.readIds();
    ids.has(listingId) ? ids.delete(listingId) : ids.add(listingId);
    await this.writeIds(ids);
    return ok(ids.has(listingId));
  }

  async isFavourited(listingId: string): Promise<boolean> {
    const ids = await this.readIds();
    return ids.has(listingId);
  }

  async getAllIds(): Promise<string[]> {
    return [...(await this.readIds())];
  }
}
