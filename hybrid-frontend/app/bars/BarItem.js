import React, { useEffect, useState } from 'react';
// import beerIcon from '../assets/images/beer_bottle_icon.png'
import { 
  View, 
  Text, 
  TextInput, 
  StatusBar, 
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@env';

const BarItem = ({bar}) => {
  const [loading, setLoading] = useState(false);
  const [addressData, setAddressData] = useState(null);
  const [countryData, setCountryData] = useState(null);

  useEffect(() => {
    const fetchAddressData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/v1/addresses/${bar.address_id}`);
            const data = await response.json();

            console.log("ADDRESS DATA:", data)

            setAddressData(data);
        } catch (error) {
            console.error("Error fetching address data:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchAddressData();
  }, [bar.address_id]);

  useEffect(() => {
    if (addressData && addressData.address) {
        const fetchCountryData = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/v1/countries/${addressData.address.country_id}`);
                const data = await response.json();
    
                console.log("COUNTRY:", data)
    
                setCountryData(data);
            } catch (error) {
                console.error("Error fetching country data:", error);
            } 
        };
        fetchCountryData();
    }

  }, [addressData]);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Text style={{ fontWeight: 'bold', fontSize: 24 }}>{bar.name}</Text>
        {loading ? (
            <Text>Loading address</Text>
        ) : addressData && countryData ? (
            <View>
                <Text>{addressData.address.line1}, {addressData.address.line2}</Text>
                <Text>{addressData.address.city}, {countryData.country.name}</Text>
            </View>
        ) : (
          <Text>No address available</Text>
        )}
      </View>
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
  addressContainer: {
    flexDirection: 'column'
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

export default BarItem;
