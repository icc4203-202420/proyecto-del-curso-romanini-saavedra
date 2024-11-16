import React, { useEffect, useState } from 'react';
import { View, Text, Button, StatusBar, StyleSheet, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { BACKEND_URL } from '@env';
import { connectWebSocket, disconnectWebSocket } from '../cable'

const Feed = () => {
  const [feedData, setFeedData] = useState([]);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  console.log("ESTAMOS EN FEED");

  const getUserId = async () => {
    try {
      const data = await SecureStore.getItemAsync('userData');
      setUserId(data);
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      const ws = connectWebSocket(userId);

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        console.log("RECEIVED MESSAGE:", response);

        if (response.type === "ping") {
          return;
        }

        if (response.message) {
          setFeedData((prevFeed) => [...prevFeed, response.message]);
        }
      };

      return () => {
        disconnectWebSocket();
      }
    }
  }, [userId]);


  const renderItem = ({item}) => {
    console.log("ITEM:", item)

    // ITEM: {
    //  "activity": "caromanini uploaded a new picture to the event 'MyString'", 
    //  "event": "MyString", 
    //  "image_url": "/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsiZGF0YSI6OSwicHVyIjoiYmxvYl9pZCJ9fQ==--21f83a67e875b2c8a3241e94784c31efaff62899/image.jpg", 
    //  "user": "caromanini"}

    return (
      <View style={styles.activityCard}>
        <Text style={styles.activityText}>{item.activity}</Text>
        <Text style={styles.eventText}>Event: {item.event}</Text>
        {item.image_url && (
          <Image
            source={{ uri: `${item.image_url}?t=${new Date().getTime()}`}}
            resizeMode='contain'
            style={styles.image}
          />
        )}
      </View>
    )
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Activity Feed</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={feedData}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
  },
  activityCard: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  activityText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventText: {
    fontSize: 14,
    color: '#888',
  },
  image: {
    marginTop: 10,
    height: 200,
    width: '100%',
    resizeMode: 'contain',
  },
});

export default Feed;