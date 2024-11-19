import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from '@env';

const barBackground = require('../../assets/images/FondoBar.jpg');

const Events = ({route}) => {
  const {bar} = route.params;
  const [eventsData, setEventsData] = useState([]);
  const navigation = useNavigation();

  console.log("bar recived in index events: ", bar);

  const getEventsData = async () => {
    try {
      const response = await fetch(`http://${BACKEND_URL}/api/v1/bars/${bar.id}/events`)
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
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString('es-GB', options);
  }

  const renderEvent = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('EventDetails', {event: item, bar: bar})}
      >
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={{fontWeight: 'bold', fontSize: 24}}>{item.name}</Text>
            <Text>Start: {formatDate(item.start_date)}</Text>
            <Text>End: {formatDate(item.end_date)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )

  }

  return (
    <View style={styles.container}>
      <Image source={barBackground} style={styles.headerImage}/>
      <View style={styles.overlayTextContainer}>
        <Text style={styles.headerTitle}>{bar.name}</Text>
        <View style={{flexDirection: 'column'}}>
          <Text style={styles.headerSubtitle}>
            {bar.address.line1}, {bar.address.line2}
          </Text>
          <Text style={styles.headerSubtitle}>
            {bar.address.city}, {bar.address.country.name}
          </Text>
        </View>
      </View>
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
    marginTop: 25,
    // marginBottom: 20,
    width: 300,
    alignItems: 'center',
  },
  card: {
    width: 300, 
    maxWidth: 600,
    height: 140,
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
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    flexDirection: 'column',
  },
  headerImage: {
    width: '100%',
    height: 300,
    opacity: 0.3
  },
  headerTextContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 18,
    marginTop: 4,
  },
  overlayTextContainer: {
    position: 'absolute',
    bottom: 490,
    left: 20,
    right: 10,
    flexDirection: 'column'
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
