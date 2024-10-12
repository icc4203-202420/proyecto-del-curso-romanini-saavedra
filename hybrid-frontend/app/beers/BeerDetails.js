import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Button
} from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import Ionicons from '@expo/vector-icons/Ionicons';
import Reviews from './Reviews';
import BarsBeers from './BarsBeers';

const beerBottleIcon = require('../../assets/images/beer_bottle_icon.png');

const BeerDetails = ({route}) => {
    const { beer } = route.params;  
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        {key: 'information', title: 'Information'},
        {key: 'reviews', title: 'Reviews'},
        {key: 'availableAt', title: 'Available at'}
    ]);

    const [brandData, setBrandData] = useState([]);
    const [breweryData, setBreweryData] = useState([]);
    const [loading, setLoading] = useState(true);

    const getBrand = async () => {
        try {
            const response = await fetch(`http://192.168.100.3:3000/api/v1/brands/${beer.brand_id}`);
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
            const response = await fetch(`http://192.168.100.3:3000/api/v1/breweries/${brandData.brewery_id}`);
            const json = await response.json();

            setBreweryData(json.brewery);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getBrand();
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
        reviews: () => (
            <Reviews/>
        ),
        availableAt: () => (
            <BarsBeers beer_id={beer.id}/>
        )
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
                        <Text style={{ marginLeft: 5 }}>
                            {beer.avg_rating !== null ? beer.avg_rating : '0.0'}
                        </Text>
                    </View>
                    <Text style={{fontSize: 36, fontWeight: 'bold'}}>{beer.name}</Text>
                    <Text style={{fontSize: 18}}>
                        Brewery: {breweryData ? breweryData.name : 'Loading...'}
                    </Text>
                    <View style={styles.reviewButtonContainer}>
                        <Button title="Review"/>
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
})

export default BeerDetails;