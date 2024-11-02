import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StatusBar, 
  StyleSheet,
  FlatList,
  TouchableOpacity
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@env';


const Events = ({route}) => {
  const {bar} = route.params;
  const [eventsData, setEventsData] = useState([]);
  const navigation = useNavigation();

  const getEventsData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/bars/${bar.id}/events`)
      const json = await response.json();

      setEventsData(json)
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getEventsData();
  }, [bar]);

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

  const renderEvent = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('EventDetails', {event: item, bar: bar})}
      >
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text>{item.name}</Text>
            <Text>{item.description}</Text>
            <Text>{formatDate(item.start_date)}</Text>
            <Text>{formatDate(item.end_date)}</Text>

          </View>
        </View>
      </TouchableOpacity>
    )

  }

  return (
    <View style={styles.container}>
      <FlatList
        data={eventsData}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cardContainer: {
    marginBottom: 20,
    width: 300,
    alignItems: 'center',
  },
  card: {
    width: 300, 
    maxWidth: 600,
    height: 170,
    backgroundColor: 'rgb(212, 160, 23)',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8, 
    overflow: 'hidden',
    padding: 10
  },
  image: {
    width: 100,
    height: 100,
    objectFit: 'cover', 
    borderRadius: 50,
  },
  content: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 10,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgb(78, 42, 30)',
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgb(78, 42, 30)',
    marginTop: 8,
    textAlign: 'left',
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '90%',
  },

});

export default Events;