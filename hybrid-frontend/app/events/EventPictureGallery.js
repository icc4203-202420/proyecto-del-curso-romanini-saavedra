import React, {useState, useEffect} from 'react';
import { 
    View, 
    Text, 
    Image, 
    StyleSheet, 
    FlatList
} from 'react-native';

import ImageUploader from './ImageUploader';

const EventPictureGallery = ({ initialImages, userId, eventId, onNewImage }) => {
    const [images, setImages] = useState(initialImages);
    
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

    const renderImage = ({item}) => {
        // console.log("ITEM:", item);
        return (

            <View style={styles.imageContainer}>
                <Image
                    source={{uri: item.image_url}}
                    style={styles.image}
                    resizeMode='contain'
                />
                <Text style={styles.description}>{item.description}</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={images}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderImage}
                contentContainerStyle={{paddingBottom: 20}}
                ListHeaderComponent={
                    <ImageUploader userId={userId} eventId={eventId} onNewImage={handleNewImage}/>
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
