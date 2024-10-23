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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@env';

import BarItem from './BarItem';

const Bars = () => {
  const navigation = useNavigation();
  const [searchKeywords, setSearchKeywords] = useState('');
  const [filteredBars, setFilteredBars] = useState([]);
  const [bars, setBars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [userData, setUserData] = useState(null);


  // const getUserData = async () => {
  //   try {
  //     const data = await AsyncStorage.getItem('userData');
  //     console.log("USER DATA EN BEER INDEX:", data) 
  //     setUserData(data);
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }

  const loadBars = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/bars`);
      const data = await response.json();
      setBars([...bars, ...data.bars]);
      setFilteredBars([...bars, ...data.bars]);
      setPage(page + 1);
    } catch (error) {
      console.error('Error fetching bars:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBars();
  }, []);

  const handleSearch = (text) => {
    setSearchKeywords(text);
    if (text === '') {
      setFilteredBars(bars);
    } else {
      const filtered = bars.filter((bar) => 
        bar.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredBars(filtered);
    }
  };

  const renderBar = ({ item }) => {
    return <BarItem bar={item}/>
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <TextInput
        style={styles.searchBar}
        placeholder="Search bars"
        value={searchKeywords}
        onChangeText={handleSearch}
      />

      {loading && <Text>Loading...</Text>}

      <FlatList
        data={filteredBars}
        renderItem={renderBar}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text>No bars available</Text>}
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

export default Bars;
