import * as React from 'react';
import {useState, useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Button, View } from 'react-native';
import Toast from 'react-native-toast-message';
import BeersScreen from './app/beers';
import BeerDetails from './app/beers/BeerDetails';
import BarsScreen from './app/bars';
import ProfileScreen from './app/profile';
import HomeScreen from './app/home';
import FindMatesScreen from './app/home/FindMates';
import LoginScreen from './app/auth/LoginScreen';
import SignUpScreen from './app/auth/SignUpScreen';
import Events from './app/events';
import EventDetails from './app/events/EventDetails';
import VideoPlayer from './app/events/VideoPlayer';
import { useUser, UserProvider } from './app/context/UserContext';
import { NotificationsProvider } from './app/context/NotificationsContext';
import * as Notifications from 'expo-notifications';
import { createNavigationContainerRef } from '@react-navigation/native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const navigationRef = createNavigationContainerRef();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bars" component={BarsScreen} />
      <Tab.Screen name="Beers" component={BeersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainApp() {
  const { isAuthenticated, logout } = useUser(); // Obtén el estado de autenticación y la función logout

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={({ navigation }) => ({
          title: '',
          headerRight: () => (
            isAuthenticated ? (
              <Button
                onPress={() => {
                  logout();
                  navigation.navigate('Home');
                  Toast.show({
                    type: 'info',
                    text1: 'Sucessful Logout',
                    text2: 'You have successfully logged out.',
                  });
                }}
                title="Logout"
                color="#000"
              />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Button
                  onPress={() => navigation.navigate('Login')}
                  title="Login"
                  color="#000"
                />
                <View style={{ width: 10 }} />
                <Button
                  onPress={() => navigation.navigate('SignUp')}
                  title="SignUp"
                  color="#000"
                />
              </View>
            )
          ),
        })}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="BeerDetails" component={BeerDetails} />
      <Stack.Screen name="Events" component={Events} />
      <Stack.Screen name="EventDetails" component={EventDetails} />
      <Stack.Screen name="FindMates" component={FindMatesScreen} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayer} />

    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;

      if (navigationRef.isReady()) {
        switch (data.type) {
          case 'attendance':
            const attendance_event = data.event;
            const attendance_bar = data.bar
            if (attendance_event && attendance_bar) {
              navigationRef.navigate('EventDetails', { event: attendance_event, bar: attendance_bar });
            }
            break;
          
          case 'tagged_image':
            const tagged_image_event = data.event
            const tagged_image_bar = data.bar 

            if (tagged_image_event && tagged_image_bar) {
              navigationRef.navigate('EventDetails', 
                { 
                  event: tagged_image_event, 
                  bar: tagged_image_bar,
                  fromNotification: true
                });
            }
            break;
  
          case 'video_generated':
            const videoEvent = data.event;
            if (videoEvent) {
              navigationRef.navigate('VideoPlayer', { event: videoEvent });
            }
            break;

          case 'friendship_created':
            navigationRef.navigate('Home')
            break;
  
          default: 
            console.log("Unkown Notificaction Type:", data.type);
        }
      }

    });

    return () => subscription.remove();
  }, []);

  return (
    <UserProvider>
      <NotificationsProvider>
        <NavigationContainer ref={navigationRef}>
          <MainApp />
          <Toast ref={(ref) => Toast.setRef(ref)} />
        </NavigationContainer>
      </NotificationsProvider>
    </UserProvider>
  );
}
