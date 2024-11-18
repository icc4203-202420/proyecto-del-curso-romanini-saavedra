import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, StatusBar, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
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
  const [friendships, setFriendships] = useState([]);
  const [eventPictures, setEventPictures] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const isDuplicate = prevFeed.some((item) => { item.created_at === data.created_at });
      console.log("IS DUPLICATE:", isDuplicate)
      if (isDuplicate) return prevFeed;

      const newFeed = [data, ...prevFeed];

      return newFeed.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    })
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
  
  const getChannelName = useCallback(() => { `feed_${userId}`}, [userId])

  const createChannel = useCallback(() => {
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
  }, [getChannelName, handleConnected, handleDisconnected, handleReceived, userId]);

  const removeChannel = useCallback(() => {
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
  }, [getChannelName, handleConnected, handleDisconnected, handleReceived]);
  
  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (isFocused && userId){
      const fetchData = async () => {
        const token = await SecureStore.getItemAsync('token');
        try {
          const friendshipsDataResponse = await fetch(`http://${BACKEND_URL}/api/v1/users/${userId}/friendships`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
          });
          const friendshipsData = await friendshipsDataResponse.json()
          setFriendships(friendshipsData);

          console.log("Friendship data:", friendshipsData)

          const eventPicturesResponse = await fetch(`http://${BACKEND_URL}/api/v1/event_pictures`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
          });
          const eventPicturesData = await eventPicturesResponse.json()

          const filteredEventPictures = eventPicturesData.filter(picture => {
            return friendshipsData.some(friendship => 
              parseInt(friendship.friend_id) === parseInt(picture.user_id)
            );
          });

          setEventPictures(filteredEventPictures);

          console.log("FILTERED EVENT PICTURES:", filteredEventPictures)

          const nonDuplicatePictures = filteredEventPictures.filter((picture) => 
            !feedData.some((item) => item.created_at === picture.created_at)
          );

          const combinedFeed = [
            ...feedData,
            ...nonDuplicatePictures,
          ].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
          setFeedData(combinedFeed);
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }
      fetchData();
    }
    
  }, [userId, isFocused, feedData])


  useEffect(() => {
    console.log("Create channel use effect")
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

  // useEffect(() => {
  //   console.log("Combined Feed useEffect.")
  //   const combinedFeed = [
  //     ...feedData, 
  //     ...eventPictures,
  //   ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  //   // Comprobar si la combinación realmente cambia antes de actualizar el estado
  //   if (parseInt(combinedFeed.length) !== parseInt(feedData.length)) {
  //     setFeedData(combinedFeed);
  //   }
  // }, [eventPictures, feedData]);

  const renderItem = ({item}) => {
    // console.log("ITEM:", item)
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('EventDetails', {event: item.event, bar: item.bar, fromNotification: true})}
      >
        <View style={styles.activityCard}>
          {/* <Text style={styles.activityText}>{item.activity}</Text>
          <Text style={styles.eventText}>Event Id: {item.event.id}</Text>
          <Text style={styles.eventText}>Bar: {item.bar.name}, {item.country_name}</Text> */}
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
      {/* {isConnected ? (
        <FlatList
          data={feedData}
          renderItem={renderItem}
          keyExtractor={(item) => item.created_at.toString()}
        />
      ) : (
        <Text style={styles.error}>
          {"You need to be logged in to see a feed."}
        </Text>
      )} */}
      {console.log("FEED DATA:", feedData)}

      <FlatList
        data={feedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.created_at.toString()}
        inverted
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