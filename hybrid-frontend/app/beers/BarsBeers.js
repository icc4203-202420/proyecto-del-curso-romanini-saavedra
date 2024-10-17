import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList
} from 'react-native';
import { BACKEND_URL } from '@env';

const BarsBeers = ({beer_id}) => {
    const [barsBeers, setBarsBeers] = useState([]);
    const [barsFiltered, setBarsFiltered] = useState([]);
    const [barsDetails, setBarsDetails] = useState({});
    const [loading, setLoading] = useState(true);

    const getBarsBeers = async () => {
        try{
            const response = await fetch(`${BACKEND_URL}/api/v1/bars_beers`);
            const json = await response.json();

            setBarsBeers(json.bars_beers);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const getBarDetails = async (barId) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/v1/bars/${barId}`);
            const json = await response.json();

            setBarsDetails(prevDetails => ({
                ...prevDetails, [barId]: json
            }))
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getBarsBeers();
    }, []);

    useEffect(() => {
        if (barsBeers.length) {
            const filtered = barsBeers.filter(
                (element) => parseInt(element.beer_id) === parseInt(beer_id)
            );
            setBarsFiltered(filtered);

            filtered.forEach(item => {
                getBarDetails(item.bar_id);
            });
        }
    }, [barsBeers, beer_id]);

    const renderBar = ({item}) => {
        const bar = barsDetails[item.bar_id];
        return (
            <View>
                <Text>{bar ? bar.name : 'Loading bar...'}</Text>
            </View>
        )
    }

    return (
        <View>
            {parseInt(barsFiltered.length) === 0 ? (
                <Text>No bars serve this beer.</Text>
            ) : (
                <FlatList
                    data={barsFiltered}
                    renderItem={renderBar}
                    keyExtractor={(item) => item.id.toString()}
                />

            )}
        </View>
    )
}

export default BarsBeers;