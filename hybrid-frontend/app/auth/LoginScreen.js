import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';
import Toast from 'react-native-toast-message';
import { BACKEND_URL } from '@env';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useUser();  // Obtiene la función login desde el contexto

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            email: email,
            password: password,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Almacena el token JWT en AsyncStorage
        console.log("Data response:",data);
        console.log("Token:",data.status.data.token);

        await AsyncStorage.setItem('token', data.status.data.token);
        // Alert.alert('Success', 'Logged in successfully');
        const storedToken = await AsyncStorage.getItem('token');
        console.log("Token almacenado:", storedToken);

        AsyncStorage.setItem('userData', JSON.stringify(data.status.data.user.id))
        const storedUserData = await AsyncStorage.getItem('userData')
        console.log("USER DATA:", storedUserData);

        // Actualiza el contexto de usuario como autenticado
        login();  // Cambia el estado global a "logueado"
        console.log("Marcado como loggeado");
        
        // Navega a la pantalla de perfil
        navigation.navigate('Profile');
        Toast.show({
          type: 'success',
          text1: 'Successful Login',
          text2: 'Welcome back!',
        });
      } else {
        Alert.alert('Error', data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Enter your email"
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Enter your password"
      />
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 16,
    borderRadius: 5,
  },
});

export default LoginScreen;

/* 
Escribir este comando en consola de windows en modo de administrador:

netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=172.31.162.160 (ip WSL)


Para buscar el ip de WSL:

hostname -I


Para buscar el ip de la máquina host (Windows):

ipconfig


El ip de la máquina host esta en: 

Adaptador de LAN inalámbrica WI-FI:

Dirección IPv4. . . . . . . . . . . . . . : 10.33.2.22


Los requests a la API se tienen que hacer al ip de la maquina host al puerto 3000, en mi caso es: 10.33.2.22. Ejemplo:

http://10.33.2.22:3000/api/v1/beers

mis IP:
WSL: 172.17.233.203
Windows: 192.168.100.3
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=172.17.233.203
http://192.168.100.3:3000/api/v1/beers
*/