import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, StatusBar, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { BACKEND_URL } from '@env';
import { ActionCable, Cable } from '@kesha-antonov/react-native-action-cable';

const Feed = () => {
  const [feedData, setFeedData] = useState([]);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const isFocused = useIsFocused();

  const navigation = useNavigation();

  const actionCable = ActionCable.createConsumer(`ws://${BACKEND_URL}/cable`);
  const cable = new Cable({});

  console.log("ESTAMOS EN FEED");
  console.log("IS CONNECTED:", isConnected);

  const getUserId = async () => {
    try {
      const data = await SecureStore.getItemAsync('userData');
      setUserId(data);
    } catch (error) {
      console.error(error)
    }
  }

  const onNewActivity = useCallback((data) => {
    console.log("New activity:", data.activity)

    setFeedData((prevFeed) => {
      const isDuplicate = prevFeed.some((item) => {
        console.log("ITEM en duplicate:", item);
        return item.created_at === data.created_at
      });
      console.log("IS DUPLICATE:", isDuplicate)
      if (isDuplicate) return prevFeed;

      return [...prevFeed, data]
    })



    // setFeedData((prevFeed) => [data, ...prevFeed]);
  }, [])

  const handleReceived = useCallback((data) => {
    console.log("Full data received:", data)

    if (data.type === 'new_post') {
      onNewActivity(data);
    }
  }, [onNewActivity]);

  const handleConnected = useCallback(() => {
    console.log("Connected to FeedChannel");
    setIsConnected(true);
  }, []);

  const handleDisconnected = useCallback(() => {
    console.log("Disconnected from FeedChannel");
    setIsConnected(false);
  }, []);
  
  const getChannelName = useCallback(() => {
    return `feed_${userId}`;
  }, [userId])

  const createChannel = useCallback(() => {
    // const actionCable = ActionCable.createConsumer(`ws://${BACKEND_URL}/cable`);
    // const cable = new Cable({});
    const channelName = getChannelName();

    const channel = cable.setChannel(
      channelName,
      actionCable.subscriptions.create({
        channel: "FeedChannel",
        user_id: userId,
      })
    );

    channel
      .on('received', handleReceived)
      .on('connected', handleConnected)
      .on('disconnected', handleDisconnected);

    return channel;
  }, [BACKEND_URL, getChannelName, handleConnected, handleDisconnected, handleReceived, userId]);

  const removeChannel = useCallback(() => {
    // const actionCable = ActionCable.createConsumer(`ws://${BACKEND_URL}/cable`);
    // const cable = new Cable({});
    const channelName = getChannelName();

    const channel = cable.channel(channelName);
    if (channel) {
      channel
        .removeListener('received', handleReceived)
        .removeListener('connected', handleConnected)
        .removeListener('disconnected', handleDisconnected);
  
      channel.unsubscribe();
      delete (cable.channels[channelName]);
    }
  }, [BACKEND_URL, getChannelName, handleConnected, handleDisconnected, handleReceived]);
  
  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (isFocused && userId) {
      const channelName = getChannelName();
      if (!cable.channel(channelName)) {
        console.log("Creating channel...");
        createChannel();
      }

      return () => {
        console.log("Removing channel...");
        removeChannel();
      }
    }
  }, [isFocused, userId, createChannel, removeChannel]);

  const renderItem = ({item}) => {
    console.log("ITEM:", item)
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('EventDetails', {event: item.event, bar: item.bar, fromNotification: true})}
      >
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>{item.activity}</Text>
          <Text style={styles.eventText}>Event: {item.event.name}</Text>
          <Text style={styles.eventText}>Bar: {item.bar.name}, {item.country_name}</Text>
          <Text style={styles.timestampText}>{new Date(item.created_at).toLocaleString()}</Text>
          {item.image_url && (
            <Image
            source={{ uri: `http://${BACKEND_URL}/${item.image_url}?t=${new Date().getTime()}`}}
            resizeMode='contain'
            style={styles.image}
            />
          )}
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    )
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Activity Feed</Text>
      {/* {!isConnected && (
        <Text style={styles.error}>
          {userId ? "Conectado al feed..." : "You need to be logged in to see a feed."}
        </Text>
      )} */}
      

      {/* {error && <Text style={styles.error}>{error}</Text>} */}

      <FlatList
        data={feedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.created_at.toString()}
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
  descriptionText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  timestampText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default Feed;