import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BACKEND_URL } from '@env';

export default function FindMatesScreen() {
  const [handle, setHandle] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [bars, setBars] = useState([]);
  const [allBars, setAllBars] = useState([]);  // Almacena la lista completa de bares
  const [selectedBar, setSelectedBar] = useState(null);
  const [error, setError] = useState(null);
  const [isBarModalVisible, setBarModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    fetchBars();
  }, []);

  const fetchBars = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/v1/bars`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setBars(data.bars || []);
      setAllBars(data.bars || []); // Guarda todos los bares para futuras búsquedas
    } catch (err) {
      console.error("Error al cargar bares:", err);
    }
  };

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
      const filteredUsers = data.users.filter((user) =>
        user.handle.toLowerCase().includes(handle.toLowerCase())
      );
      setSearchResults(filteredUsers);
    } catch (err) {
      setError('Ocurrió un error al buscar usuarios');
      console.error(err);
    }
  };

  const confirmAddFriend = (user) => {
    setSelectedUserId(user.id);
    setBarModalVisible(true);
  };

  const addFriend = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
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
            friend_id: selectedUserId,
            bar_id: selectedBar.id,
          },
        }),
      });

      if (!response.ok) {
        setError('Error al agregar amistad');
        return;
      }

      const result = await response.json();
      console.log('Amistad creada:', result);
      setBarModalVisible(false);
      Alert.alert('Éxito', 'Amigo agregado con éxito');
    } catch (err) {
      setError('Ocurrió un error al agregar la amistad');
      console.error(err);
    }
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

      {/* Modal para seleccionar el bar */}
      <Modal visible={isBarModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona el bar donde se conocieron</Text>
            <TextInput
              style={styles.searchBar}
              placeholder="Buscar bar..."
              onChangeText={(text) => {
                if (text === '') {
                  // Restaurar todos los bares cuando el campo de búsqueda esté vacío
                  setBars(allBars);
                } else {
                  const filteredBars = allBars.filter((bar) =>
                    bar.name.toLowerCase().includes(text.toLowerCase())
                  );
                  setBars(filteredBars);
                }
              }}
            />
            <ScrollView>
              {bars.map((bar) => (
                <TouchableOpacity
                  key={bar.id}
                  style={styles.barOption}
                  onPress={() => setSelectedBar(bar)}
                >
                  <Text style={styles.barName}>{bar.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button title="Confirmar" onPress={addFriend} disabled={!selectedBar} />
            <Button title="Cancelar" onPress={() => setBarModalVisible(false)} />
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchBar: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  barOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  barName: {
    fontSize: 16,
    textAlign: 'center',
  },
});
