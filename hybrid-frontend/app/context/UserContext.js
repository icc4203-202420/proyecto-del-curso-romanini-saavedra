import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    checkAuthStatus();
  }, []);

  const login = async () => {
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log("Token almacenado:", token);
      const response = await fetch('http://127.0.0.1:3001/api/v1/logout', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await AsyncStorage.removeItem('token');
        setIsAuthenticated(false);
        console.log('Logout successful');
        console.log('response from back', response);
      } else {
        console.error('Logout failed');
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
