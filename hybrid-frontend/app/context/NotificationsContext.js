import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@env';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState(null);

  useEffect(() => {
    const registerForPushNotifications = async () => {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      if (status === 'granted') {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        setExpoPushToken(token);
        console.log('Expo Push Token:', token);
        await storeTokenToBackend(token);
      } else {
        alert('Permission for notifications was denied');
      }
    };

    const storeTokenToBackend = async (token) => {
      const userToken = await AsyncStorage.getItem('token');
      await fetch(`${BACKEND_URL}/api/v1/users/update_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ expo_push_token: token }),
      });
    };

    registerForPushNotifications();
  }, []);

  return (
    <NotificationsContext.Provider value={{ expoPushToken }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);