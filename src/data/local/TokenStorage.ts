/**
 * Tokens go through expo-secure-store (Keychain on iOS, Keystore on
 * Android), never AsyncStorage - AsyncStorage is unencrypted on-disk, and
 * a refresh token is a long-lived bearer credential worth protecting like
 * a password.
 */
export interface TokenStorage {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  setTokens(accessToken: string, refreshToken: string): Promise<void>;
  clear(): Promise<void>;
}

export class SecureTokenStorage implements TokenStorage {
  async getAccessToken(): Promise<string | null> {
    // import * as SecureStore from 'expo-secure-store';
    // const ACCESS_KEY = 'auth_access_token';
    // return SecureStore.getItemAsync(ACCESS_KEY);
    throw new Error('Wire up expo-secure-store: SecureStore.getItemAsync(ACCESS_KEY)');
  }
  async getRefreshToken(): Promise<string | null> {
    // const REFRESH_KEY = 'auth_refresh_token';
    throw new Error('Wire up expo-secure-store: SecureStore.getItemAsync(REFRESH_KEY)');
  }
  async setTokens(/* _accessToken: string, _refreshToken: string */): Promise<void> {
    // await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
    // await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
    throw new Error('Wire up expo-secure-store: SecureStore.setItemAsync(...)');
  }
  async clear(): Promise<void> {
    // await SecureStore.deleteItemAsync(ACCESS_KEY);
    // await SecureStore.deleteItemAsync(REFRESH_KEY);
    throw new Error('Wire up expo-secure-store: SecureStore.deleteItemAsync(...)');
  }
}
