import React, { useState } from 'react';
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
import { createVideoFromImages } from './videoUtils';

const ImageUploader = ({userId, eventId, onNewImage, showSummaryButton, images}) => {
  // console.log("ESTAMOS EN IMAGEUPLOADER");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState('');

  const handleChooseImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
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

    if (permissionResult.granted === false) {
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
      // print("SUBIENDO NUEVA FOTO!!!!");
      const response = await axios.post(`${BACKEND_URL}/api/v1/event_pictures`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // console.log("Image uploaded successfully", response.data);
      // console.log("RESPONSE DE IMAGE UPLOAD:", response);

      // console.log("URL DE IMAGEN:", response.data.image_url);

      onNewImage(response.data)

      setModalVisible(false);
      setSelectedImage(null);
      setDescription('');
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      await fetch(`${BACKEND_URL}/events/${eventId}/generate_summary`, { method: 'POST' });
      Alert.alert('Resumen en proceso', 'Se te notificará cuando el video esté listo.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo iniciar la generación del video.');
      setIsGenerating(false);
    }
  };


  return (
    <View>
      {/* <Button title="Upload Image" onPress={() => setModalVisible(true)} /> */}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.uploadButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>UPLOAD IMAGE</Text>
        </Pressable>
        {showSummaryButton && (
          <Pressable style={styles.uploadButton} onPress={() => handleGenerateSummary()}>
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
    marginRight: 10,
    marginLeft: 10
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default ImageUploader;
