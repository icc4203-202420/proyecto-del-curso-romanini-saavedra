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
    const fetchVideoUri = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/events/${event.id}/video`);
        const data = await response.json();

        if (data.video_url) {
          setVideoUri(data.video_url);
        } else {
          setError('Video not available at the moment.');
        }
      } catch (error) {
        setError('There was an error loading the video. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoUri();
  }, [event.id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading video...</Text>
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
        <Text style={styles.errorText}>Video not available</Text>
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
