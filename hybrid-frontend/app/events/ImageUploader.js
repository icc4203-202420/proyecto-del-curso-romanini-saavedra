import React, { useState, useEffect } from 'react';
import { 
  Alert,
  Button, 
  Modal, 
  View, 
  TextInput, 
  Image, 
  StyleSheet, 
  ScrollView,
  Pressable,
  Text
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

import { BACKEND_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ImageUploader = ({ userId, eventId, onNewImage, showSummaryButton }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState('');
  const [friends, setFriends] = useState([]); 
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [friendDetails, setFriendDetails] = useState([]);

  useEffect(() => {
    if (modalVisible) {
      fetchFriendships();
    }
  }, [modalVisible]);

  const fetchFriendships = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
		  const token = storedToken.replace(/"/g, '')

      const response = await fetch(`${BACKEND_URL}/api/v1/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error fetching friendships');
      }

      const allUsers = data.users.filter(user => parseInt(user.id) !== parseInt(userId));

      setFriends(allUsers); 

    } catch (error) {
      console.error("Error fetching friendships:", error);
    }
  };

  const handleChooseImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.cancelled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleTakePicture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission to use camera is required!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync();
    if (!result.cancelled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage || !description) {
      Alert.alert("Please select an image and add a description.");
      return;
    }

    const formData = new FormData();
    formData.append('event_picture[image]', {
      uri: selectedImage,
      type: 'image/jpeg', 
      name: 'image.jpg',
    });
    formData.append('event_picture[description]', description);
    formData.append('event_picture[user_id]', userId);
    formData.append('event_picture[event_id]', eventId);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/event_pictures`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const pictureId = response.data.event_picture.id; 

      await tagFriends(pictureId);
      
      onNewImage(response.data);
      setModalVisible(false);
      setSelectedImage(null);
      setDescription('');
      setTaggedFriends([]);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const tagFriends = async (pictureId) => {
    try {
      const tagUsersArray = taggedFriends.map(friendId => ({
        user_id: parseInt(userId),
        tagged_user_id: parseInt(friendId),
        picture_id: parseInt(pictureId),
      }));

      const response = await axios.post(`${BACKEND_URL}/api/v1/tag_users`, {
        tag_users: tagUsersArray
      });
    } catch (error) {
      console.error("Error tagging friends:", error);
    }
  };

  const handleTagFriend = (friendId) => {
    setTaggedFriends((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  // const handleGenerateSummary = async () => {
  //   setIsGenerating(true);
  //   try {
  //     await fetch(`${BACKEND_URL}/events/${eventId}/generate_summary`, { method: 'POST' });
  //     Alert.alert('Resumen en proceso', 'Se te notificará cuando el video esté listo.');
  //   } catch (error) {
  //     console.error(error);
  //     Alert.alert('Error', 'No se pudo iniciar la generación del video.');
  //     setIsGenerating(false);
  //   }
  // };

  const handleGenerateSummary = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/events/${eventId}/generate_summary`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error("Failed to generate video.");
      }

      const data = await response.json();
      console.log("DATA DE VIDEO:", data)

      Alert.alert("Video Summary Generation", data.message);
    } catch (error) {
      console.error("Error generating video:", error);
    }
    
  }

  // const handleGenerateSummary = () => {
  //   console.log("SUMMARY BUTTON")
  // }

  return (
    <View>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.uploadButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>UPLOAD IMAGE</Text>
        </Pressable>
        {showSummaryButton && (
          <Pressable style={styles.uploadButton} onPress={handleGenerateSummary}>
            <Text style={styles.buttonText}>SUMMARY</Text>
          </Pressable>
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Button title="Choose from Gallery" onPress={handleChooseImage} />
          <Button title="Take Picture" onPress={handleTakePicture} />

          {selectedImage && (
            <ScrollView style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TextInput
                placeholder="Add a description..."
                value={description}
                onChangeText={setDescription}
                style={styles.descriptionInput}
              />
              <Text style={styles.tagTitle}>Tag Friends:</Text>
              {friends && friends.length > 0 ? ( 
                friends.map((friend, index) => {
                  return (
                    <Pressable
                      key={friend.id}
                      onPress={() => handleTagFriend(friend.id)}
                      style={[
                        styles.friendButton,
                        taggedFriends.includes(friend.id) && styles.selectedFriendButton
                      ]}
                    >
                      <Text style={styles.friendButtonText}>
                        {friend ? friend.handle : 'Loading...'} {taggedFriends.includes(friend.id) ? "(Tagged)" : ""}
                      </Text>
                    </Pressable>
                  )
                })
              ) : (
                <Text>No users available to tag.</Text>
              )}
            </ScrollView>
          )}

          <Button title="Upload" onPress={handleUploadImage} />
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  imagePreviewContainer: {
    marginVertical: 10,
  },
  imagePreview: {
    width: '100%',
    height: 300, 
    resizeMode: 'contain',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  uploadButton: {
    width: 130,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 5,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tagTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  friendButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginVertical: 5,
  },
  selectedFriendButton: {
    backgroundColor: '#b3d9ff',
  },
  friendButtonText: {
    fontSize: 16,
  },
});

export default ImageUploader;
