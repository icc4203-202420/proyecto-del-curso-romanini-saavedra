import React, {useState, useEffect} from 'react';
import { 
    View, 
    Text, 
    Image, 
    StyleSheet, 
    FlatList,
    Pressable,
    Alert,
    ActivityIndicator
} from 'react-native';
import { BACKEND_URL } from '@env';
import * as SecureStore from 'expo-secure-store';

import ImageUploader from './ImageUploader';

const EventPictureGallery = ({ initialImages, userId, event, onNewImage }) => {
    const [images, setImages] = useState(initialImages);
    const [usernames, setUsernames] = useState({});
    const [taggedUsers, setTaggedUsers] = useState([]);
    const [friendships, setFriendships] = useState([]);
    const [isLoadingImage, setIsLoadingImage] = useState(true);

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
                const response = await fetch(`http://${BACKEND_URL}/api/v1/tag_users`);
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
            const response = await fetch(`http://${BACKEND_URL}/api/v1/users/${user_id}`);
            const data = await response.json();
            setUsernames((prev) => ({ ...prev, [user_id]: data.user.handle }));
        } catch (error) {
            console.error("Error fetching username:", error);
        } 
    }

    const getFriendships = async () => {
        const currentUserId = await SecureStore.getItemAsync('userData');
        const token = await SecureStore.getItemAsync('token');
        try {
            const response = await fetch(`http://${BACKEND_URL}/api/v1/users/${currentUserId}/friendships`, {
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
                friend_id: friendId,
                bar_id: event.bar_id,
              },
            }),
          });
    
          const result = await response.json();

          setFriendships((prev) => Array.isArray(prev) ? [...prev, result.friendship] : [result.friendship]);

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

        // console.log("ITEM PARA IMAGE:", item)
        // console.log("URL DE IMAGE:", item.image_url)

        return (
            <View style={styles.imageContainer}>
                <View style={styles.header}>
                    <Text style={styles.uploaderText}>Uploaded by: {usernames[item.user_id] || 'Loading...'}</Text>

                </View>

                {isLoadingImage && <ActivityIndicator size='small' color='#888' style={styles.loadingIndicator}/>}
                <Image
                    // source={{uri: item.image_url}}
                    source={{ uri: `${item.image_url}?t=${new Date().getTime()}`}}
                    style={styles.image}
                    resizeMode='contain'
                    onLoadEnd={() => setIsLoadingImage(false)}
                />
                <Text style={styles.description}>{item.description}</Text>
                {taggedUsernames.length > 0 && (
                    <View style={styles.taggedContainer}>
                        <Text style={styles.taggedTitle}>Tagged Users:</Text>
                        {taggedUsernames.map(({id, username}) => {
                            const isFriend = (id) => Array.isArray(friendships) && friendships.some(friendship => 
                                friendship.friend_id === id
                            );

                            const isCurrentUser = parseInt(id) === parseInt(userId);

                            return (
                                <View key={id} style={styles.tagContainer}>
                                    <Text style={[styles.taggedText, isFriend(id) && styles.friendText]}>{username}</Text>
                                    {!isFriend(id) && !isCurrentUser && (
                                        <Pressable onPress={() => handleAddUser(id)} style={styles.addButton}>
                                            <Text style={styles.addButtonText}>Add</Text>
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
      backgroundColor: '#fff',
      borderRadius: 10,
      marginBottom: 15,
      padding: 10,
      borderWidth: 1,
      borderColor: '#ddd',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 5
    },
    header: {
        marginBottom: 5,
    },
    uploaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    loadingIndicator: {
        position: 'absolute',
        alignSelf: 'center',
        top: 100
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
    taggedTitle: {
        fontSize: 14, 
        fontWeight: '600',
        color: '#333',
        marginBottom: 5
    },
    tagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        marginVertical: 3
    },
    taggedText: {
        fontSize: 14,
        color: '#444'
    },
    friendText: {
        fontWeight: 'bold',
        color: '#2a9d8f'
    },
    addButton: {
        marginLeft: 10,
        paddingVertical: 3,
        paddingHorizontal: 8,
        backgroundColor: '#007bff',
        borderRadius: 5,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 12,
    },
    tagButton: {
        marginLeft: 10,
        color: 'blue'
    }
  });

export default EventPictureGallery;
