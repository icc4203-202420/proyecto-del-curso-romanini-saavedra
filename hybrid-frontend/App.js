import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Button } from 'react-native';
import BeersScreen from './app/beers';
import BeerDetails from './app/beers/BeerDetails';
import BarsScreen from './app/bars';
import ProfileScreen from './app/profile';
import HomeScreen from './app/home';
import LoginScreen from './app/auth/LoginScreen';
import { useUser, UserProvider } from './app/context/UserContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
          title: 'My App',
          headerRight: () => (
            isAuthenticated ? (
              <Button
                onPress={() => {
                  logout(); // Llama a logout para cambiar el estado de autenticación
                  navigation.navigate('Home'); // Redirige a Home después de hacer logout
                }}
                title="Logout"
                color="#000"
              />
            ) : (
              <Button
                onPress={() => navigation.navigate('Login')}
                title="Login"
                color="#000"
              />
            )
          ),
        })}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="BeerDetails" component={BeerDetails} />

    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <MainApp />
      </NavigationContainer>
    </UserProvider>
  );
}
