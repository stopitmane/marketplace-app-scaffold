import * as Notifications from 'expo-notifications';

/**
 * Client-side push registration/listening is implemented for real below.
 * What's still a gap: marketplace-backend has no endpoint to store a
 * user's push token, and no trigger that calls Expo's push API (e.g. from
 * OrdersService.checkout on order confirmation) - so a token is fetched
 * here but has nowhere to be sent yet. Add a `PATCH /users/me { pushToken }`
 * endpoint and call it after registerForPushNotifications() resolves.
 */
export interface PushNotifications {
  registerForPushNotifications(): Promise<string | null>; // returns Expo push token
  onNotificationReceived(handler: (data: Record<string, unknown>) => void): () => void; // returns unsubscribe
}

export class ExpoPushNotifications implements PushNotifications {
  async registerForPushNotifications(): Promise<string | null> {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return null;
    const { data } = await Notifications.getExpoPushTokenAsync();
    return data;
  }

  onNotificationReceived(handler: (data: Record<string, unknown>) => void): () => void {
    const subscription = Notifications.addNotificationReceivedListener((notification) =>
      handler(notification.request.content.data),
    );
    return () => subscription.remove();
  }
}
