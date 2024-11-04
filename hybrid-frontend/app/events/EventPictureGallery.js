import React, {useState, useEffect} from 'react';
import { 
    View, 
    Text, 
    Image, 
    StyleSheet, 
    FlatList,
    Pressable,
    Alert
} from 'react-native';
import { BACKEND_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ImageUploader from './ImageUploader';

const EventPictureGallery = ({ initialImages, userId, event, onNewImage }) => {
    const [images, setImages] = useState(initialImages);
    const [usernames, setUsernames] = useState({});
    const [taggedUsers, setTaggedUsers] = useState([]);
    const [friendships, setFriendships] = useState([]);
    
    const handleNewImage = (response) => {
        const newImage = response.event_picture;
        
        if (newImage && newImage.id) {
            setImages((prevImages) => [newImage, ...prevImages]);
        } else {
            console.error("La nueva imagen no tiene una propiedad 'id'.", newImage);
        }
    };

    useEffect(() => {
        const fetchTaggedUsers = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/v1/tag_users`);
                const data = await response.json();
                setTaggedUsers(data.tag_users);

                const taggedUserIds = [...new Set(data.tag_users.map(tag => tag.tagged_user_id))];
                taggedUserIds.forEach(user_id => {
                    if (!usernames[user_id]) {
                        fetchUsername(user_id);
                    }
                });
            } catch (error) {
                console.error("Error fetching tagged users:", error);
            }
        };

        fetchTaggedUsers();
    }, []);

    useEffect(() => {
        const userIds = [...new Set(images.map(image => image.user_id))];
        userIds.forEach(user_id => {
            if (!usernames[user_id]) {
                fetchUsername(user_id);
            }
        })
    }, [images]);

    const fetchUsername = async (user_id) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/v1/users/${user_id}`);
            const data = await response.json();
            setUsernames((prev) => ({ ...prev, [user_id]: data.user.handle }));
        } catch (error) {
            console.error("Error fetching username:", error);
        } 
    }

    const getFriendships = async () => {
        const currentUserId = await AsyncStorage.getItem('userData');
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await fetch(`${BACKEND_URL}/api/v1/users/${currentUserId}/friendships`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            const data = await response.json()
            
            setFriendships(data)
        } catch (error) {
            console.error("Error fetching friendships:", error)
        }
    }

    useEffect(() => {
        getFriendships();
    }, [])

    const handleAddUser = async (friendId) => {
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
                friend_id: friendId,
                bar_id: event.bar_id,
              },
            }),
          });
    
          const result = await response.json();

          setFriendships(prev => [...prev, result.friendship]);

          Alert.alert('Success', 'User added successfully!');
        } catch (err) {
          console.error(err);
        }
      };

    const renderImage = ({item}) => {
        const tagsForImage = taggedUsers.filter(tag => tag.picture_id === item.id)
        const taggedUsernames = tagsForImage.map(tag => ({
            id: tag.tagged_user_id,
            username: usernames[tag.tagged_user_id]
        }));

        return (
            <View style={styles.imageContainer}>
                <Text>Uploaded by: {usernames[item.user_id] || 'Loading...'}</Text>
                <Image
                    // source={{uri: item.image_url}}
                    source={{ uri: `${item.image_url}?t=${new Date().getTime()}`}}
                    style={styles.image}
                    resizeMode='contain'
                />
                <Text style={styles.description}>{item.description}</Text>
                {taggedUsernames.length > 0 && (
                    <View style={styles.taggedContainer}>
                        <Text>Tagged Users:</Text>
                        {taggedUsernames.map(({id, username}) => {
                            const isFriend = friendships.some(friendship => 
                                friendship.friend_id === id
                            );

                            return (
                                <View key={id} style={styles.tagContainer}>
                                    <Text>{username}</Text>
                                    {!isFriend && (
                                        <Pressable onPress={() => handleAddUser(id)}>
                                            <Text style={styles.tagButton}>Add</Text>
                                        </Pressable>
                                    )}

                                </View>
                            )
                        })}

                    </View>
                )}
            </View>
        )
    }

    const isEventEnded = new Date() > new Date(event.end_date);

    return (
        <View style={styles.container}>
            <FlatList
                data={images}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderImage}
                contentContainerStyle={{paddingBottom: 20}}
                ListHeaderComponent={
                    <ImageUploader 
                        userId={userId} 
                        eventId={event.id} 
                        onNewImage={onNewImage} 
                        showSummaryButton={isEventEnded}
                        images={images}
                    />
                }
            />
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
    },
    imageContainer: {
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: 200, 
      resizeMode: 'cover',
    },
    description: {
      padding: 10,
      fontSize: 16,
      color: '#333',
    },
    taggedContainer: {
        marginTop: 10,
    },
    tagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    tagButton: {
        marginLeft: 10,
        color: 'blue'
    }
  });

export default EventPictureGallery;
