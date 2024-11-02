import React, {useState, useEffect} from 'react';
import { 
    View, 
    Text, 
    Image, 
    StyleSheet, 
    FlatList
} from 'react-native';
import { BACKEND_URL } from '@env';

import ImageUploader from './ImageUploader';

const EventPictureGallery = ({ initialImages, userId, event, onNewImage }) => {
    const [images, setImages] = useState(initialImages);
    const [usernames, setUsernames] = useState({});
    
    const handleNewImage = (response) => {
        // Extraer la nueva imagen del objeto de respuesta
        const newImage = response.event_picture;
        
        // Verificar que la nueva imagen tenga un id antes de agregarla
        if (newImage && newImage.id) {
            setImages((prevImages) => [newImage, ...prevImages]);
        } else {
            console.error("La nueva imagen no tiene una propiedad 'id'.", newImage);
        }
    };

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

    const renderImage = ({item}) => {
        return (
            <View style={styles.imageContainer}>
                <Text>Uploaded by: {usernames[item.user_id] || 'Loading...'}</Text>
                <Image
                    source={{uri: item.image_url}}
                    style={styles.image}
                    resizeMode='contain'
                />
                <Text style={styles.description}>{item.description}</Text>
            </View>
        )
    }

    const handleSummaryPress = () => {
        console.log("SE APRETO EL BOTON DE SUMMARY");
    }

    const isEventEnded = new Date() > new Date(event.end_date);
    console.log("EVENT ENDED?", isEventEnded)

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
                        onNewImage={handleNewImage} 
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
      height: 200, // Ajusta la altura según tus necesidades
      resizeMode: 'cover',
    },
    description: {
      padding: 10,
      fontSize: 16,
      color: '#333',
    },
  });

export default EventPictureGallery;
