import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Button,
    Alert
} from 'react-native';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import Ionicons from '@expo/vector-icons/Ionicons';

import { BACKEND_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const beerBottleIcon = require('../../assets/images/beer_bottle_icon.png');

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
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        {key: 'information', title: 'Information'},
        {key: 'photos', title: 'Photos'},
        {key: 'People', title: 'People'}
    ]);

    const renderScene = SceneMap({
        information: () => (
            <View style={styles.infoContainer}>
                <Text style={{color:'black'}}>Name: {event.name}</Text>
                <Text style={{color: 'black', fontSize: 15}}>Description: {event.description}</Text>
                <Text style={{color: 'black', fontSize: 15}}>Start Date: {event.start_date}</Text>
                <Text style={{color: 'black', fontSize: 15}}>End Date: {event.end_date}</Text>
            </View>
        ), 
        photos: () => <Text>Photos</Text>,
        people: () => <Text>People</Text>
    });

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <View style={styles.overlayTextContainer}>
                    <Text style={{fontSize: 36, fontWeight: 'bold'}}>{event.name}</Text>
                    <Text style={{fontSize: 18}}>Bar: {bar.name}</Text>
                    <View style={styles.reviewButtonContainer}>
                        <Button
                            title="Confirm Attendance"
                        />
                    </View>
                </View>
            </View>
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
    }
})

export default EventDetails;