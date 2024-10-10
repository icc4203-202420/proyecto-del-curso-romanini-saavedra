import React, { useEffect, useState } from 'react';
// import beerIcon from '../assets/images/beer_bottle_icon.png'
import { 
  View, 
  Text, 
  TextInput, 
  StatusBar, 
  StyleSheet,
  Button,
  FlatList
} from 'react-native';

const Beers = () => {
  const [searchKeywords, setSearchKeywords] = useState('');
  const [filteredBeers, setFilteredBeers] = useState([]);
  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  const loadBeers = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`http://192.168.88.245:3000/api/v1/beers`);
      const data = await response.json();
      console.log("DATA:", data.beers)
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
      <View style={styles.cardContainer}>
        <View style={styles.card}>
            <Text>{item.name}</Text>
            <Text>Style: {item.style}</Text>
        </View>
      </View>
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
    alignItems: 'center',
    borderRadius: 8, 
    overflow: 'hidden',
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
