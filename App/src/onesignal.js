import {LogLevel, OneSignal} from 'react-native-onesignal';
import {ONESIGNAL_APP_ID} from '@env';
import {navigationRef} from '../App';

export const oneSignalInitiate = () => {
  // Remove this method to stop OneSignal Debugging
  OneSignal.Debug.setLogLevel(LogLevel.Verbose);

  // OneSignal Initialization
  OneSignal.initialize(ONESIGNAL_APP_ID);

  // requestPermission will show the native iOS or Android notification permission prompt.
  // We recommend removing the following code and instead using an In-App Message to prompt for notification permission
  OneSignal.Notifications.requestPermission(true);

  // Method for listening for notification clicks
  OneSignal.Notifications.addEventListener('click', event => {
    const additionalData = event?.notification?.additionalData;
    const screen = additionalData?.screen;
    const params = additionalData?.params || {};

    console.log(additionalData);

    if (screen && navigationRef.current) {
      console.log(`Navigating to ${screen} with params:`, params);
      navigationRef.current.navigate(screen, params);
    } else {
      console.log(
        'Navigation failed: Screen name not found in additionalData.',
      );
    }
  });
};
