import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Button,
} from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import Ionicons from '@expo/vector-icons/Ionicons';
import Reviews from './Reviews';
import BarsBeers from './BarsBeers';
import CreateReview from './CreateReview';

import AsyncStorage from '@react-native-async-storage/async-storage';

const beerBottleIcon = require('../../assets/images/beer_bottle_icon.png');

const BeerDetails = ({route}) => {
    const { beer } = route.params;  
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        {key: 'information', title: 'Information'},
        {key: 'reviews', title: 'Reviews'},
        {key: 'availableAt', title: 'Available at'}
    ]);

    const [beerData, setBeerData] = useState(null);
    const [brandData, setBrandData] = useState([]);
    const [breweryData, setBreweryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [userData, setUserData] = useState(null);

    const getUserData = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        setUserData(data);
      } catch (error) {
        console.error(error)
      }
    }

    const getBrand = async () => {
        try {
            const response = await fetch(`http://192.168.88.245:3000/api/v1/brands/${beer.brand_id}`);
            const json = await response.json();

            setBrandData(json.brand)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const getBrewery = async () => {
        if (!brandData) return;
        try {
            const response = await fetch(`http://192.168.88.245:3000/api/v1/breweries/${brandData.brewery_id}`);
            const json = await response.json();

            setBreweryData(json.brewery);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const getBeerData = async () => {
        try {
            const response = await fetch(`http://192.168.88.245:3000/api/v1/beers/${beer.id}`);
            const json = await response.json();

            setBeerData(json.beer);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getBeerData();
        getBrand();
        getUserData();
    }, []);

    useEffect(() => {
        if (brandData) {
            getBrewery();
        }
    }, [brandData]);

    const renderScene = SceneMap({
        information: () => (
            <View style={{padding: 10}}>
                <Text style={{fontweight: 'bold', color:'black'}}>Style: {beer.style}</Text>
                <Text style={{color: 'black'}}>Alcohol: {beer.alcohol}</Text>
                <Text style={{color: 'black'}}>Hops: {beer.hop}</Text>
                <Text style={{color: 'black'}}>IBU: {beer.ibu}</Text>
                <Text style={{color: 'black'}}>Yeast: {beer.yeast}</Text>
                <Text style={{color: 'black'}}>Malts: {beer.malts}</Text>
            </View>
        ), 
        reviews: () => <Reviews beerId={beer.id} userId={userData}/>,
        availableAt: () => <BarsBeers beer_id={beer.id}/>
    });

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={beerBottleIcon}
                    style={styles.beerImage}
                    resizeMode="contain"
                />
                <View style={styles.overlayTextContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="star" size={20} color="gold" />
                            {beerData && (
                                <Text style={{marginLeft: 5}}>
                                    {beerData.avg_rating !== null ? (beerData.avg_rating).toFixed(1) : 'No reviews yet'}
                                </Text>
                            )}
                    </View>
                    <Text style={{fontSize: 36, fontWeight: 'bold'}}>{beer.name}</Text>
                    <Text style={{fontSize: 18}}>
                        Brewery: {breweryData ? breweryData.name : 'Loading...'}
                    </Text>
                    <View style={styles.reviewButtonContainer}>
                        <Button
                            title="Review"
                            onPress={() => setModalVisible(true)}
                        />
                    </View>
                </View>
            </View>
            <View style={styles.tabViewContainer}>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: 300 }}
                />
            </View>
            <CreateReview
                userId={userData}
                beerId={beer.id}
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                onReviewCreated={getBeerData}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        bottom: 90,
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
})

export default BeerDetails;