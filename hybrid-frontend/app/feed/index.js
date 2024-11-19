import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, Button, StatusBar, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { BACKEND_URL } from '@env';
import { ActionCable, Cable } from '@kesha-antonov/react-native-action-cable';
import { Picker } from '@react-native-picker/picker';

const Feed = () => {
  const [feedData, setFeedData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const isFocused = useIsFocused();
  const [friendshipsReviews, setFriendshipsReviews] = useState(null);
  const [friendships, setFriendships] = useState([]);
  const [eventPictures, setEventPictures] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all'); // Default: mostrar todo
  const [filterValue, setFilterValue] = useState('');

  const navigation = useNavigation();

  const actionCable = ActionCable.createConsumer(`ws://${BACKEND_URL}/cable`);
  const cable = new Cable({});

  console.log("ESTAMOS EN FEED");
  console.log("IS CONNECTED:", isConnected);
  console.log("isFocused:", isFocused)

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

    let newData;

    if (data.type === "new_post") {
      newData = {
          type: 'photo',
          activity: `Friend: ${data.user}`,
          user: data.user,
          event: data.event,
          bar: data.bar,
          country_name: data.country_name,
          description: data.description,
          created_at: data.created_at,
          image_url: data.image_url,
          tagged_users: data.tagged_users
        }
    } else {
      newData ={
          type: 'review',
          activity: `Friend: ${data.user}`,
          user: data.user,
          beer_name: data.beer.name,
          bar_obj: data.bar_obj,
          rating: data.rating,
          avg_rating: data.avg_rating,
          comment: data.comment,
          created_at: data.created_at
      }
    }
    // console.log("NEW DATA EN onNewActivity:", newData);

    // Validar si pasa el filtro actual
    const passesFilter = (() => {
      switch (selectedFilter) {
        case 'friend':
          return newData.user?.toLowerCase().includes(filterValue.toLowerCase());
        case 'bar':
          return newData.bar?.name?.toLowerCase().includes(filterValue.toLowerCase());
        case 'country':
          return newData.country_name?.toLowerCase().includes(filterValue.toLowerCase());
        case 'beer':
          return newData.beer_name?.toLowerCase().includes(filterValue.toLowerCase());
        default:
          return true;
      }
    })();

    if (!passesFilter) return; // Ignora si no cumple con el filtro actual


    setFeedData((prevFeed) => {
      const isDuplicate = prevFeed.some((item) => { item.created_at === data.created_at });
      // console.log("IS DUPLICATE:", isDuplicate)
      if (isDuplicate) return prevFeed;

      const newFeed = [newData, ...prevFeed];

      // console.log("NEW FEED (esto es en onNewActivity):", newFeed)

      return newFeed.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    })

    // setFeedData((prevFeed) => [data, ...prevFeed]);
  }, [selectedFilter, filterValue]);

  const handleReceived = useCallback((data) => {
    console.log("Full data received:", data)

    if (data.type === 'new_post' || data.type === 'new_review') {
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
  
  const fetchFriendships = async () => {
    const token = await SecureStore.getItemAsync('token');
    const userId = await SecureStore.getItemAsync('userData');
    try {
      const response = await fetch(`http://${BACKEND_URL}/api/v1/users/${userId}/friendships`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json()
      // console.log("Friendship data:", data);
      setFriendships(data)
      return data;
    } catch (error) {
      console.error("Error fetching friendship data:", error);
      return [];
    }
  }

  const fetchEventPictures = async () => {
    const token = await SecureStore.getItemAsync('token');
    try {
      const response = await fetch(`http://${BACKEND_URL}/api/v1/event_pictures`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json()
      // console.log("Even Pictures data:", data);
      setEventPictures(data)
      return data;
    } catch (error) {
      console.error("Error fetching eventPictures data:", error);
      return [];
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
      // console.log("response from fetchUserFriends: ", data);
      const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      // console.log("sorted version of response: ", sortedData);
      setFriendshipsReviews(sortedData);
      return sortedData;
    } catch (err) {
      console.error("Error loading friendships:", err);
      return [];
    }
  };

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

  const feedDataRef = useRef(feedData);

  useEffect(() => {
    // console.log("SE ESTA EJECUTANDO LA FUNCION DE FETCH DE TODO!!!")
    const fetchPicturesAndReviews = async () => {
      try {
        const userId = await SecureStore.getItemAsync('userData')
        const token = await SecureStore.getItemAsync('token');
        // console.log("USER ID:", userId)
        if (userId) {
          // console.log("Entramos a buscar las cosas para el fetch")
          const eventPicturesData = await fetchEventPictures();
          const friendshipsReviewsData = await fetchUserFriendsReviews();
          // console.log("friendshipsReviewsData: ", friendshipsReviewsData);
          const friendshipsData = await fetchFriendships();
  
          const filteredEventPictures = eventPicturesData.filter(picture => 
            friendshipsData.some(friendship => 
              parseInt(friendship.friend_id) === parseInt(picture.user_id)
            )
          );
  
          const nonDuplicatePictures = [];
          const seenCreatedAtPictures = new Set();

          filteredEventPictures.forEach(picture => {
            if (!seenCreatedAtPictures.has(picture.created_at)) {
              nonDuplicatePictures.push(picture);
              seenCreatedAtPictures.add(picture.created_at);
            }
          })

          const seenCreatedAtReviews = new Set();
          const uniqueReviews = friendshipsReviewsData.filter(review => {
            if (!seenCreatedAtReviews.has(review.created_at)) {
              seenCreatedAtReviews.add(review.created_at);
              return true;
            }
            return false;
          });

          // console.log("UNIQUE REVIEWS:", uniqueReviews)

          // console.log("FILTERED IMAGES:", nonDuplicatePictures)

          const combinedFeed = [
            ...nonDuplicatePictures.map(picture => ({
              id: picture.id,
              type: 'photo',
              activity: `Friend: ${picture.user.handle}`,
              user: picture.user.handle,
              event: picture.event,
              bar: picture.bar,
              country_name: picture.country.name,
              description: picture.description,
              created_at: picture.created_at,
              image_url: picture.image_url,
              tagged_users: picture.tagged_users
            })),
            ...uniqueReviews.map(review =>({
              type: 'review',
              activity: `Friend: ${review.friend_handle}`,
              user: review.friend_handle,
              beer_name: review.beer_name,
              rating: review.rating,
              avg_rating: review.avg_rating,
              comment: review.text,
              created_at: review.created_at,
              bar_obj: review.bar_obj
            }))
          ];

          // console.log("COMBINED FEED:", combinedFeed);

          const sortedFeed = combinedFeed.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

          feedDataRef.current = sortedFeed;
          setFeedData(feedDataRef.current)

          // console.log("Images to display from backend:", filteredEventPictures)
          // console.log("Feed Data:", feedData);
          // console.log("Imagenes FINALES filtradas:", nonDuplicatePictures)

          // feedDataRef.current = nonDuplicatePictures;
          // setFeedData(feedDataRef.current);
        }
      } catch (error) {
        console.error("Error fetching friendship and eventPicture data:", error)
      }
    }
    if (isFocused) {
      fetchPicturesAndReviews();  
    }
  }, [isFocused])


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

  const renderItem = ({item}) => {
    // console.log("ITEM:", item)



    if (item.type === 'photo'){
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
              // source={{ uri: `http://${BACKEND_URL}/${item.image_url}?t=${new Date().getTime()}`}}
              source={{ uri: `${item.image_url}?t=${new Date().getTime()}`}}
              resizeMode='contain'
              style={styles.image}
              />
            )}
            <Text style={styles.descriptionText}>{item.description}</Text>
            {item.tagged_users && parseInt(item.tagged_users.length) > 0 && (
              <View style={styles.taggedUsersContainer}>
                <Text style={styles.taggedUsersLabel}>Tagged Users:</Text>
                {item.tagged_users.map((user) => (
                  <Text key={user.id} style={styles.taggedUser}>
                    @{user.handle}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </TouchableOpacity>
      )
    }

    return (
      <TouchableOpacity 
        onPress={() => {
          if (item.bar_obj) {
            // Si bar_obj existe, navegar al evento
            navigation.navigate('Events', { bar: item.bar_obj });
          } else {
            // Si bar_obj es null o undefined, mostrar una alerta
            Alert.alert('No Bars Available', 'This beer is not sold at any bar.');
          }
        }}
      >
        <View style={styles.reviewCard}>
          <Text style={styles.friendHandle}>{item.activity}</Text>
          <Text style={styles.reviewText}>Review: {item.comment}</Text>
          <Text style={styles.beerName}>Beer: {item.beer_name}</Text>
          <Text style={styles.rating}>Friend's Rating: {item.rating} / 5</Text>
          <Text style={styles.avgRating}>Avg Rating: {item.avg_rating} / 5</Text>
          <Text style={styles.timestamp}>
            Reviewed at: {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  const applyFilter = () => {
    let filteredFeed = [...feedDataRef.current]; // Copia los datos originales
  
    switch (selectedFilter) {
      case 'friend':
        filteredFeed = filteredFeed.filter(item => item.user.toLowerCase().includes(filterValue.toLowerCase()));
        break;
      case 'bar':
        filteredFeed = filteredFeed.filter(item => item.bar?.name.toLowerCase().includes(filterValue.toLowerCase()));
        break;
      case 'country':
        filteredFeed = filteredFeed.filter(item => item.country_name?.toLowerCase().includes(filterValue.toLowerCase()));
        break;
      case 'beer':
        filteredFeed = filteredFeed.filter(item => item.beer_name?.toLowerCase().includes(filterValue.toLowerCase()));
        break;
      default:
        // "All" muestra todos los datos
        filteredFeed = [...feedDataRef.current];
    }
  
    setFeedData(filteredFeed); // Actualiza el estado con los datos filtrados
  };
  
  return (
    <View style={styles.container}>
      {/* Filtros */}
      <View style={styles.filterContainer}>
        <Picker
          selectedValue={selectedFilter}
          onValueChange={(itemValue) => setSelectedFilter(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="All" value="all" />
          <Picker.Item label="Friends" value="friend" />
          <Picker.Item label="Bar" value="bar" />
          <Picker.Item label="Country" value="country" />
          <Picker.Item label="Beer" value="beer" />
        </Picker>

        {/* Input para el valor del filtro */}
        {selectedFilter !== 'all' && (
          <TextInput
            placeholder={`Enter ${selectedFilter}`}
            value={filterValue}
            onChangeText={setFilterValue}
            style={styles.filterInput}
          />
        )}
      </View>

      <Button title="Apply Filter" onPress={() => applyFilter()} style={styles.filterButton} />

      <Text style={styles.header}>Activity Feed</Text>
      <FlatList
        data={feedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.created_at.toString()}
        contentContainerStyle={styles.feedList}
        ListFooterComponent={<View style={{ height: 20 }} />}
      />

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  taggedUsersContainer: {
    marginTop: 10,
    padding: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  taggedUsersLabel: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  taggedUser: {
    color: '#007bff',
  },
  filterContainer: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  picker: {
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
  },
  filterInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  filterButton: {
    marginTop: 8,
  },
  feedList: {
    paddingBottom: 20,
  },
});

export default Feed;