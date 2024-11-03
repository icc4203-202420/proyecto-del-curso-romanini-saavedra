import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState(null);

  useEffect(() => {
    const registerForPushNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();

      if (status === 'granted') {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        setExpoPushToken(token);
        // console.log('Expo Push Token:', token);
        const userToken = await AsyncStorage.getItem('token');
      } else {
        alert('Permission for notifications was denied');
      }
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