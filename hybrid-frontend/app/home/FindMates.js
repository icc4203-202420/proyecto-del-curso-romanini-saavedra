import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BACKEND_URL } from '@env';
import { useUser } from '../context/UserContext';


export default function FindMatesScreen() {
  const [handle, setHandle] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [bars, setBars] = useState([]);
  const [allBars, setAllBars] = useState([]);
  const [selectedBar, setSelectedBar] = useState(null);
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState(null);
  const [isBarModalVisible, setBarModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [friendshipsData, setFriendshipsData] = useState(null);

  const { isAuthenticated } = useUser();

  useEffect(() => {
    fetchBars();
  }, []);

  useEffect(() => {
    if (selectedBar) {
      fetchEvents(selectedBar.id);
    }
  }, [selectedBar]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserFriends();
    }
  }, [isAuthenticated]);

  const fetchUserFriends = async () => {
    const token = await SecureStore.getItemAsync('token');
    const userId = await SecureStore.getItemAsync('userData');
    try {
      const response = await fetch(`http://${BACKEND_URL}/api/v1/users/${userId}/friendships`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("response from fetchUserFriends: ", data);
      setFriendshipsData(data);
    } catch (err) {
      console.error("Error loading friendships:", err);
    }
  };

  const fetchBars = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await fetch(`http://${BACKEND_URL}/api/v1/bars`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setBars(data.bars || []);
      setAllBars(data.bars || []);
    } catch (err) {
      console.error("Error loading bars:", err);
    }
  };

  const fetchEvents = async (barId) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await fetch(`http://${BACKEND_URL}/api/v1/bars/${barId}/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setEvents(data || []);
      setAllEvents(data || []);
    } catch (err) {
      console.error("Error loading events:", err);
    }
  };

  const handleSearch = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userId = await SecureStore.getItemAsync('userData');
      if (!token) {
        setError('Authentication token not found.');
        return;
      }

      const response = await fetch(`http://${BACKEND_URL}/api/v1/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setError('Error searching users');
        return;
      }

      const data = await response.json();
      const friendsIds = friendshipsData.map(friend => friend.friend_id);
      console.log("lista de ids amigos: ", friendsIds);
      const filteredUsers = data.users.filter(
        (user) =>
          user.handle.toLowerCase().includes(handle.toLowerCase()) &&
          !friendsIds.includes(user.id) &&
          user.id !== parseInt(userId)
      );
      console.log("usuarios filtrados: ", filteredUsers);
      setSearchResults(filteredUsers);
    } catch (err) {
      setError('An error ocurred searching for users');
      console.error(err);
    }
  };

  const confirmAddFriend = (user) => {
    setSelectedUserId(user.id);
    setBarModalVisible(true);
  };

  const addFriend = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userId = await SecureStore.getItemAsync('userData');

      const response = await fetch(`http://${BACKEND_URL}/api/v1/friendships`, {
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
        setError('Error adding friendship');
        return;
      }

      const result = await response.json();
      console.log('Amistad creada:', result);
      setBarModalVisible(false);
      Alert.alert('Success', 'User added successfully');
    } catch (err) {
      setError('An error ocurred adding new friendship');
      console.error(err);
    }

    try {
      const token = await SecureStore.getItemAsync('token');
      const userId = await SecureStore.getItemAsync('userData');

      const response = await fetch(`http://${BACKEND_URL}/api/v1/friendships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          friendship: {
            user_id: selectedUserId,
            friend_id: userId,
            bar_id: selectedBar.id,
          },
        }),
      });

      if (!response.ok) {
        setError('Error adding friendship 2');
        return;
      }

      const result = await response.json();
      console.log('Amistad creada:', result);
      setBarModalVisible(false);
      Alert.alert('Success', 'User added successfully 2');
    } catch (err) {
      setError('An error ocurred adding new friendship 2');
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
      <Text>Search users by handle</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter handle"
        value={handle}
        onChangeText={setHandle}
      />
      <Button 
        title="Search" 
        onPress={() => {
          if (isAuthenticated) {
            handleSearch();
          } else {
            Alert.alert('Please Log In', 'You must be logged in to find mates.');
          }
        }}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <ScrollView style={styles.resultsList}>
        {searchResults.map(renderUserItem)}
      </ScrollView>

      {/* Modal para seleccionar el bar */}
      <Modal visible={isBarModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select the bar where you met</Text>
            <TextInput
              style={styles.searchBar}
              placeholder="Search bar..."
              onChangeText={(text) => {
                if (text === '') {
                  setBars(allBars);
                } else {
                  const filteredBars = allBars.filter((bar) =>
                    bar.name.toLowerCase().includes(text.toLowerCase())
                  );
                  setBars(filteredBars);
                }
              }}
            />
            <ScrollView style={styles.barListContainer}>
              {bars.map((bar) => (
                <TouchableOpacity
                  key={bar.id}
                  style={[
                    styles.barOption,
                    selectedBar && selectedBar.id === bar.id && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedBar(bar)}
                >
                  <Text style={[
                    styles.barName,
                    selectedBar && selectedBar.id === bar.id && styles.selectedText
                  ]}>
                    {bar.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.modalTitle}>Select an event from the bar</Text>
            <TextInput
              style={styles.searchBar}
              placeholder="Search event..."
              onChangeText={(text) => {
                if (text === '') {
                  setEvents(allEvents);
                } else {
                  const filteredEvents = allEvents.filter((event) =>
                    event.name.toLowerCase().includes(text.toLowerCase())
                  );
                  setEvents(filteredEvents);
                }
              }}
            />
            <ScrollView style={styles.barListContainer}>
              {events.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={[
                    styles.barOption,
                    selectedEvent && selectedEvent.id === event.id && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedEvent(event)}
                >
                  <Text style={[
                    styles.barName,
                    selectedEvent && selectedEvent.id === event.id && styles.selectedText
                  ]}>
                    {event.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button title="Confirm" onPress={addFriend} disabled={!selectedBar} />
            <Button title="Cancel" onPress={() => setBarModalVisible(false)} />
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
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchBar: {
    marginVertical: 10,
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
  },
  barListContainer: {
    maxHeight: 200,
  },
  barOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedOption: {
    backgroundColor: '#e0e0e0',
  },
  barName: {
    fontSize: 16,
  },
  selectedText: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
});