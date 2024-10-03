import React, { useEffect, useState } from 'react';
import useAxios from 'axios-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import beerIcon from '../assets/images/beer_bottle_icon.png'
import { 
  View, 
  Text, 
  TextInput, 
  StatusBar, 
  StyleSheet,
  Button,
  FlatList,
  Platform
} from 'react-native';

let localStorage;
if (Platform.OS === 'web') {
  localStorage = window.localStorage;
}

const Beers = () => {
  const [searchKeywords, setSearchKeywords] = useState('');
  const [keywordList, setKeywordList] = useState([]);
  const [filteredBeers, setFilteredBeers] = useState([]);
  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  const isWeb = Platform.OS === 'web';

  const loadBeers = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:3001/api/v1/beers?limit=5&offset=${(page - 1) * 5}`);
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

  const loadKeywords = async () => {
    try {
      if (isWeb) {
        const storedKeywords = localStorage.getItem('BeerMates/SearchBeer/KeywordList');
        if (storedKeywords !== null) {
          setKeywordList(JSON.parse(storedKeywords));
        }
      } else {
        const storedKeywords = await AsyncStorage.getItem('BeerMates/SearchBeer/KeywordList');
        if (storedKeywords !== null) {
          setKeywordList(JSON.parse(storedKeywords));
        }
      }
    } catch (error) {
      console.error('Error loading keywords', error);
    }
  };

  const storeKeywords = async (newKeywordList) => {
    try {
      if (isWeb) {
        localStorage.setItem('BeerMates/SearchBeer/KeywordList', JSON.stringify(newKeywordList));
      } else {
        await AsyncStorage.setItem('BeerMates/SearchBeer/KeywordList', JSON.stringify(newKeywordList));
      }
      setKeywordList(newKeywordList);
    } catch (error) {
      console.error('Error saving keywords', error);
    }
  };

  useEffect(() => {
    // loadKeywords();
    loadBeers();
    
  }, []);

  // const handleSearch = (searchKeywords) => {
  //   if (searchKeywords && !keywordList.includes(searchKeywords)) {
  //     const updatedKeywordList = [...keywordList, searchKeywords];
  //     storeKeywords(updatedKeywordList);
  //   }
  // };

  const handleSearch = (text) => {
    setSearchKeywords(text);
    if (text === '') {
      // Si no hay texto en la barra de búsqueda, mostrar todas las cervezas
      setFilteredBeers(beers);
    } else {
      // Filtrar las cervezas por el nombre que coincida con el texto ingresado
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
          {/* <Image
            source={{ beerIcon }} 
            style={styles.image}
          /> */}
          <View style={styles.content}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.subtitle}>{`Style: ${item.style}`}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Beers Screen</Text>
      <StatusBar style="auto" />

      <TextInput
        style={styles.searchBar}
        placeholder="Search beers"
        value={searchKeywords}
        onChangeText={handleSearch}
      />

      {loading && <Text>Loading...</Text>}

      {console.log("BEER DATA EN VIEW:", beers)}

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
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '90%', 
    maxWidth: 600,
    height: 170,
    backgroundColor: 'rgb(212, 160, 23)',
    flexDirection: 'row',
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
