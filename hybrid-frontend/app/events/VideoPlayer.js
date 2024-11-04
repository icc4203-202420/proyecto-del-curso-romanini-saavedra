import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

import { BACKEND_URL } from '@env';

const VideoPlayer = ({ route }) => {
  const { event } = route.params;
  const [videoUri, setVideoUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Función para obtener la URL del video a partir del eventId
    const fetchVideoUri = async () => {
      try {
        // Aquí puedes reemplazar la URL por la ruta de tu backend
        const response = await fetch(`${BACKEND_URL}/api/v1/events/${event.id}/video`);
        const data = await response.json();
        
        if (data.event.videoUri) {
          setVideoUri(data.videoUri);
        } else {
          setError('El video no está disponible en este momento.');
        }
      } catch (error) {
        setError('Hubo un error al cargar el video. Por favor, intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoUri();
  }, [eventId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando video...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {videoUri ? (
        <Video
          source={{ uri: videoUri }}
          style={styles.video}
          useNativeControls
          resizeMode="contain"
          shouldPlay
        />
      ) : (
        <Text style={styles.errorText}>Video no disponible</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: 300,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default VideoPlayer;
