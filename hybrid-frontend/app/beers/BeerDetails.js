import React from 'react';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';

const BeerDetails = ({route}) => {
    const { beer } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{beer.name}</Text>
            <Text style={styles.subtitle}>Style: {beer.style}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
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