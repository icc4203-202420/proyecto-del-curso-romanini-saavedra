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
            <View style={styles.barsBeersContainer}>
                <View style={styles.card}>
                    <Text style={{fontSize: 16, fontWeight: 'bold'}}>{bar ? bar.name : 'Loading bar...'}</Text>
                </View>
            </View>
        )
    }

    return (
        <View>
            {parseInt(barsFiltered.length) === 0 ? (
                <Text style={styles.noBarsText}>No bars serve this beer.</Text>
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

const styles = StyleSheet.create({
    barsBeersContainer: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        top: 10,
    },
    card: {
        width: 200,
        height: 100,
        backgroundColor: 'rgb(212, 160, 23)',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        overflow: 'hidden',
    },
    noBarsText: {
      textAlign: 'center',
      top: 20
    }
})

export default BarsBeers;