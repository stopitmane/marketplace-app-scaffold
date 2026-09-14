/**
 * Structural stub for Expo push notifications. Wire this up once there's
 * a server-side trigger worth notifying about (e.g. "your order was
 * confirmed" - marketplace-backend would need to store the push token
 * against the User and call Expo's push API from OrdersService.checkout).
 */
export interface PushNotifications {
  registerForPushNotifications(): Promise<string | null>; // returns Expo push token
  onNotificationReceived(handler: (data: Record<string, unknown>) => void): () => void; // returns unsubscribe
}

export class ExpoPushNotifications implements PushNotifications {
  async registerForPushNotifications(): Promise<string | null> {
    // import * as Notifications from 'expo-notifications';
    // const { status } = await Notifications.requestPermissionsAsync();
    // if (status !== 'granted') return null;
    // const { data } = await Notifications.getExpoPushTokenAsync();
    // return data; // send this to your backend: PATCH /users/me { pushToken: data }
    throw new Error('Wire up expo-notifications - see commented implementation above');
  }

  onNotificationReceived(/* _handler: (data: Record<string, unknown>) => void */): () => void {
    // const subscription = Notifications.addNotificationReceivedListener(
    //   (notification) => handler(notification.request.content.data)
    // );
    // return () => subscription.remove();
    throw new Error('Wire up expo-notifications - see commented implementation above');
  }
}
