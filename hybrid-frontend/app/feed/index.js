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
  const [friendshipsReviews, setFriendshipsReviews] = useState(null);

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

  const fetchUserFriendsReviews = async () => {
    const token = await SecureStore.getItemAsync('token');
    const userId = await SecureStore.getItemAsync('userData');
    setFriendshipsReviews(null);
    try {
      const response = await fetch(`http://${BACKEND_URL}/api/v1/users/${userId}/friends_reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("response from fetchUserFriends: ", data);
      const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      console.log("sorted version of response: ", sortedData);
      setFriendshipsReviews(sortedData);
    } catch (err) {
      console.error("Error loading friendships:", err);
    }
  };

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
  const fetchReviews = async () => {
    if (userId) {
      await fetchUserFriendsReviews();
    }
  };

  if (isFocused) {
    fetchReviews();
  }
}, [isFocused, userId]);

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

  const renderReviewItem = ({ item }) => {
    const handleReviewPress = () => {
      navigation.navigate('BeerDetails', { beer: item.beer_obj });
    };

    return (
      <TouchableOpacity onPress={handleReviewPress}>
        <View style={styles.reviewCard}>
          <Text style={styles.friendHandle}>Friend: {item.friend_handle}</Text>
          <Text style={styles.reviewText}>Review: {item.text}</Text>
          <Text style={styles.beerName}>Beer: {item.beer_name}</Text>
          <Text style={styles.rating}>Friend's Rating: {item.rating} / 5</Text>
          <Text style={styles.avgRating}>Avg Rating: {item.avg_rating} / 5</Text>
          <Text style={styles.timestamp}>
            Reviewed at: {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
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

      <FlatList
        data={friendshipsReviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id.toString()}
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
  reviewCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  friendHandle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  beerName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: '#007bff',
  },
  avgRating: {
    fontSize: 14,
    color: '#28a745',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
});

export default Feed;