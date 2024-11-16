import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { BACKEND_URL } from '@env';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await SecureStore.getItemAsync('token');
      const storedUserData = await SecureStore.getItemAsync('userData');
      setIsAuthenticated(!!token);
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
    };

    checkAuthStatus();
  }, []);

  const login = async () => {
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const storedUserData = await SecureStore.getItemAsync('userData');
      console.log("Token almacenado:", token);

      const response = await fetch(`http://${BACKEND_URL}/api/v1/logout`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('userData');
        setIsAuthenticated(false);
        console.log('Logout successful');
        console.log('response from back', response);
      } else {
        console.error('Logout failed');
        console.error(response);
      }
    } catch (error) {
      console.error('Network error during logout:', error);
    }
  };

  return (
    <UserContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);