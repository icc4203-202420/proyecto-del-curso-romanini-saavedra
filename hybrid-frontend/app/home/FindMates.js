import React, { useState } from 'react';
import { View, TextInput, Button, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BACKEND_URL } from '@env'; // Importa la URL del backend

export default function FindMatesScreen() {
  const [handle, setHandle] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedBar, setSelectedBar] = useState({ id: 1 }); // Suponiendo que tienes una forma de seleccionar el bar

  const handleSearch = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setError('Error en la búsqueda de usuarios');
        return;
      }

      const data = await response.json();

      // Filtro con insensibilidad a mayúsculas y coincidencias parciales
      const filteredUsers = data.users.filter((user) =>
        user.handle.toLowerCase().includes(handle.toLowerCase())
      );
      setSearchResults(filteredUsers);
    } catch (err) {
      setError('Ocurrió un error al buscar usuarios');
      console.error(err);
    }
  };

  const addFriend = async (friendId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      const userId = await AsyncStorage.getItem('userData');

      const response = await fetch(`${BACKEND_URL}/api/v1/friendships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          friendship: {
            user_id: userId,
            friend_id: friendId,
            bar_id: selectedBar.id, // Asegúrate de que esto se seleccione correctamente en tu app
          },
        }),
      });

      if (!response.ok) {
        setError('Error al agregar amistad');
        return;
      }

      const result = await response.json();
      console.log('Amistad creada:', result);
      Alert.alert('Éxito', 'Amigo agregado con éxito');
    } catch (err) {
      setError('Ocurrió un error al agregar la amistad');
      console.error(err);
    }
  };

  const confirmAddFriend = (user) => {
    Alert.alert(
      'Confirmar Agregar Amigo',
      `¿Estás seguro de que deseas agregar a ${user.handle} como amigo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Agregar', onPress: () => addFriend(user.id) }, // Se pasa el ID del usuario a agregar
      ]
    );
  };

  const renderUserItem = (user) => (
    <View key={user.id} style={styles.userItem}>
      <Icon name="user" size={24} color="#555" style={styles.userIcon} />
      <Text style={styles.userHandle}>{user.handle}</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => confirmAddFriend(user)}>
        <Text style={styles.addButtonText}>+ ADD</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text>Buscar usuarios por handle</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter handle"
        value={handle}
        onChangeText={setHandle}
      />
      <Button title="Search" onPress={handleSearch} />
      {error && <Text style={styles.error}>{error}</Text>}
      <ScrollView style={styles.resultsList}>
        {searchResults.map(renderUserItem)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    width: '80%',
    padding: 10,
    margin: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    alignSelf: 'center',
  },
  error: {
    color: 'red',
    marginVertical: 10,
    alignSelf: 'center',
  },
  resultsList: {
    flex: 1,
    width: '100%',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userIcon: {
    marginRight: 10,
  },
  userHandle: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
