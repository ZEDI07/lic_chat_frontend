import * as Notifications from "expo-notifications"
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Device from 'expo-device';
import Constants from 'expo-constants';

function handleRegistrationError(errorMessage) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  console.log("device ", Device.isDevice)
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log("existing", existingStatus)
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    // const projectId =
    //   Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    // if (!projectId) {
    //   handleRegistrationError('Project ID not found');
    // }
    try {
      console.log('tehere')
      const pushTokenString = await Notifications.getDevicePushTokenAsync()
      console.log("Push TOKEN  <>>>><<<<<<<<>>>>>>>>>", pushTokenString)
    } catch (e) {
      console.log("error while registion", e)
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}



export default () => {
  console.log("inside notification componentn>>>>>>>>>>>")
  const notificationListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => console.log("token     <<<<<<<<<<<>>>>>>>>>", token))
      .catch((error) => console.log("error while registering", error));
  }, [])
  return null;
}