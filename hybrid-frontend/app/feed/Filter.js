import { TouchableOpacity, StyleSheet, Text } from "react-native";

const Filter = ({ users, bars, countries, onFilterChange}) => {
    return (
        <View style={styles.filterContainer}>
            <Text>Filter By User:</Text>
            {users.map((user) => (
                <TouchableOpacity key={user.id} onPress={() => onFilterChange('user', user.id)}>
                    <Text>{user.name}</Text>
                </TouchableOpacity>
            ))}

            <Text>Filter by Bar:</Text>
            {bars.map((bar) => (
            <TouchableOpacity key={bar.id} onPress={() => onFilterChange('bar', bar.id)}>
                <Text>{bar.name}</Text>
            </TouchableOpacity>
            ))}

            <Text>Filter by Country:</Text>
            {countries.map((country) => (
            <TouchableOpacity key={country} onPress={() => onFilterChange('country', country)}>
                <Text>{country}</Text>
            </TouchableOpacity>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    filterContainer: {
        marginBottom: 20,
    },
    filterButton: {
        padding: 10,
        backgroundColor: '#eee',
        marginVertical: 5,
        borderRadius: 5,
    },
});

export default Filter;