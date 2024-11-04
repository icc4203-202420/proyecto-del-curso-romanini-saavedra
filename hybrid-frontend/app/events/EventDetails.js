import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Button,
    Alert,
    Pressable
} from 'react-native';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import Ionicons from '@expo/vector-icons/Ionicons';

import { BACKEND_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Attendees from './Attendees';
import ImageUploader from './ImageUploader';
import CreateAttendance from './CreateAttendance';
import EventPictureGallery from './EventPictureGallery';
import VideoPlayer from './VideoPlayer';

const beerBottleIcon = require('../../assets/images/beer_bottle_icon.png');
const barBackground = require('../../assets/images/FondoBar.jpg');

const renderTabBar = props => (
  <TabBar
        {...props}
        // style={{ backgroundColor: 'black' }}
        labelStyle={{ color: 'white' }}
        indicatorStyle={{backgroundColor: 'rgb(212, 160, 23)'}}
  />
)

const EventDetails = ({route}) => {
    const {event} = route.params;
    const {bar} = route.params;
    const {fromNotification} = route.params;

  
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        {key: 'information', title: 'Information'},
        {key: 'photos', title: 'Photos'},
        {key: 'people', title: 'People'},
    ]);

    const [modalVisible, setModalVisible] = useState(false);
    const [userData, setUserData] = useState(null);
    const [attendanceData, setAttendaceData] = useState([]);
    const [picturesData, setPicturesData] = useState([]);

    const getUserData = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        setUserData(data);
      } catch (error) {
        console.error(error)
      }
    }

    const getAttendanceData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/attendances`);
        const json = await response.json();
        const filteredAttendances = json.attendances.filter(attendance => attendance.event_id === event.id);

        setAttendaceData(filteredAttendances);
      } catch (error) {
        console.error(error);
      }
    }

    const getPicturesData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/event_pictures?event_id=${event.id}`);
        const json = await response.json();
        const sortedImages = json.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

        setPicturesData(sortedImages)
      } catch (error) {
        console.error(error);
      }
    }

    const handleNewImageUpload = () => {
      // setPicturesData((prevImages) => [...prevImages, newImage]);
      getPicturesData();
    };

    useEffect(() => {
      getUserData();
      getAttendanceData();
      getPicturesData();

      if (fromNotification) {
        setIndex(routes.findIndex(route => route.key === 'photos'));
      }
    }, []);

    useEffect(() => {
      if (index === routes.findIndex(route => route.key === 'photos')) {
        getPicturesData();
      }
    }, [index]);

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const options = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      return date.toLocaleDateString('es-ES', options);
    }

    const renderScene = SceneMap({
        information: () => (
            <View style={styles.infoContainer}>
                <Text style={{color:'black'}}>Name: {event.name}</Text>
                <Text style={{color: 'black', fontSize: 15}}>Description: {event.description}</Text>
                <Text style={{color: 'black', fontSize: 15}}>Start Date: {formatDate(event.start_date)}</Text>
                <Text style={{color: 'black', fontSize: 15}}>End Date: {formatDate(event.end_date)}</Text>
            </View>
        ), 
        photos: () => {
          if (!userData) {
            return (
              <Text style={{textAlign: 'center', marginTop: 20}}>
                Please log in to view the photo gallery.
              </Text>
            )
          }
          return (
            <EventPictureGallery
              initialImages={picturesData}
              userId={userData}
              event={event}
              onNewImage={handleNewImageUpload}
            />
          )
        },
        people: () => <Attendees/>
    });

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={barBackground}
                    style={styles.beerImage}
                />
                <View style={styles.overlayTextContainer}>
                    <Text style={{fontSize: 36, fontWeight: 'bold'}}>{event.name}</Text>
                    <Text style={{fontSize: 18}}>Bar: {bar.name}</Text>
                    <View style={styles.reviewButtonContainer}>
                        <Pressable 
                          style={styles.uploadButton} 
                          onPress={() => {
                            if (!userData) {
                              Alert.alert('Please Log In', 'You must be logged in to confirm attendance to an event.');
                            } else {
                              setModalVisible(true);
                            }
                          }}
                        >
                            <Text style={styles.buttonText}>CONFIRM ATTENDANCE</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
            <View style={styles.tabViewContainer}>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: 300 }}
                    renderTabBar={renderTabBar}
                />
            </View>
            <CreateAttendance
              userId={userData}
              eventId={event.id}
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              onAttendanceCreated={getAttendanceData}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    infoContainer: {
      padding: 16,
      height: '100%',
      left: 10
    },
    tabViewContainer: {
      flex: 1
    },
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: 300,
      flexDirection: 'column'
    },   
    reviewButtonContainer: {
      top: 10,
      width: 100,
    },
    beerImage: {
      width: '100%',
      height: 300,
      opacity: 0.2,
    },
    overlayTextContainer: {
      position: 'absolute',
      bottom: 50,
      left: 20,
      right: 10,
      flexDirection: 'column'
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 18,
      marginBottom: 5,
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },
    modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 35,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    button: {
      borderRadius: 20,
      padding: 10,
      elevation: 2,
    },
    buttonOpen: {
      backgroundColor: '#F194FF',
    },
    buttonClose: {
      backgroundColor: '#2196F3',
    },
    textStyle: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    modalText: {
      marginBottom: 15,
      textAlign: 'center',
    },
    notLoggedInText: {
      textAlign: 'center',
      top: 20
    },
    uploadButton: {
      width: 175,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#2196F3',
      borderRadius: 5,
      marginBottom: 10
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold'
    }
})

export default EventDetails;