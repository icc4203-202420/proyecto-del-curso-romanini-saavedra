import React, { useEffect, useState } from 'react';
// import beerIcon from '../assets/images/beer_bottle_icon.png'
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
import * as SecureStore from 'expo-secure-store';
import { BACKEND_URL } from '@env';

const Beers = () => {
  const navigation = useNavigation();
  const [searchKeywords, setSearchKeywords] = useState('');
  const [filteredBeers, setFilteredBeers] = useState([]);
  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [userData, setUserData] = useState(null);

  const getUserData = async () => {
    try {
      const data = await SecureStore.getItemAsync('userData');
      // console.log("USER DATA EN BEER INDEX:", data) 
      setUserData(data);
    } catch (error) {
      console.error(error)
    }
  }

  const loadBeers = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`http://${BACKEND_URL}/api/v1/beers`);
      const data = await response.json();
      setBeers([...beers, ...data.beers]);
      setFilteredBeers([...beers, ...data.beers]);
      setPage(page + 1);
    } catch (error) {
      console.error('Error fetching beers:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBeers();
    getUserData();
  }, []);

  const handleSearch = (text) => {
    setSearchKeywords(text);
    if (text === '') {
      setFilteredBeers(beers);
    } else {
      const filtered = beers.filter((beer) => 
        beer.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredBeers(filtered);
    }
  };

  const renderBeer = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => navigation.navigate('BeerDetails', {beer: item})}
      >
        
          <View style={styles.card}>
              <Text style={{fontWeight: 'bold', fontSize: 24}}>{item.name}</Text>
              <Text>Style: {item.style}</Text>
          </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <TextInput
        style={styles.searchBar}
        placeholder="Search beers"
        value={searchKeywords}
        onChangeText={handleSearch}
      />

      {loading && <Text>Loading...</Text>}

      <FlatList
        data={filteredBeers}
        renderItem={renderBeer}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text>No beers available</Text>}
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

export default Beers;
