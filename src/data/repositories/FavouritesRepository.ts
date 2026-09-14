import type { Result } from '../../core/types/Result';
import type { AppError } from '../../core/errors/AppError';

export interface IFavouritesRepository {
  toggle(listingId: string): Promise<Result<boolean, AppError>>; // returns new favourited state
  isFavourited(listingId: string): Promise<boolean>;
  getAllIds(): Promise<string[]>;
}

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
  private ids = new Set<string>(); // in-memory cache over the persisted set; see toggle()

  async toggle(/* _listingId: string */): Promise<Result<boolean, AppError>> {
    // import AsyncStorage from '@react-native-async-storage/async-storage';
    // const raw = await AsyncStorage.getItem('favourite_ids');
    // const ids = new Set<string>(raw ? JSON.parse(raw) : []);
    // ids.has(listingId) ? ids.delete(listingId) : ids.add(listingId);
    // await AsyncStorage.setItem('favourite_ids', JSON.stringify([...ids]));
    // return ok(ids.has(listingId));
    throw new Error('Wire up @react-native-async-storage/async-storage - see commented implementation above');
  }

  async isFavourited(/* _listingId: string */): Promise<boolean> {
    throw new Error('Wire up AsyncStorage read, mirroring toggle()');
  }

  async getAllIds(): Promise<string[]> {
    throw new Error('Wire up AsyncStorage read, mirroring toggle()');
  }
}
