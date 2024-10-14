import React, {useState, useReducer, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList
} from 'react-native';

const initialState = {
    reviewsData: [],
    loading: false,
    error: null,
};

const reviewsReducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REVIEWS_REQUEST':
            return { ...state, loading: true, error: null };
        case 'FETCH_REVIEWS_SUCCESS':
            return { ...state, loading: false, reviewsData: action.payload };
        case 'FETCH_REVIEWS_FAILURE':
            return { ...state, loading: false, error: action.error };
        default:
            return state;
    }
};

const Reviews = ({beerId, userId}) => {
    const [state, dispatch] = useReducer(reviewsReducer, initialState);
    const [userNames, setUserNames] = useState({});

    const getReviews = async () => {
        dispatch({ type: 'FETCH_REVIEWS_REQUEST' });
        try {
            const response = await fetch(`http://192.168.88.245:3000/api/v1/beers/${beerId}/reviews`);
            const json = await response.json();

            const sortedReviews = json.sort((a, b) => {
                if (a.user_id === userId) return -1;
                if (b.user_id === userId) return 1;
                return 0;
            });

            dispatch({ type: 'FETCH_REVIEWS_SUCCESS', payload: sortedReviews });
            fetchUserNames(sortedReviews);
        } catch (error) {
            dispatch({ type: 'FETCH_REVIEWS_FAILURE', error: 'Failed to fetch reviews' });
        }
    }

    const fetchUserNames = async (reviews) => {
        const userIds = [...new Set(reviews.map(review => review.user_id))]; 
        const newUserNames = {};

        for (let userId of userIds) {
            try {
                const response = await fetch(`http://192.168.88.245:3000/api/v1/users/${userId}`);
                const userData = await response.json();

                newUserNames[userId] = userData.user.handle; 
            } catch (error) {
                console.error(`Failed to fetch user data for user_id: ${userId}`);
            }
        }

        setUserNames(newUserNames); 
    };

    useEffect(() => {
        getReviews();
    }, []);

    if (state.loading) {
        return (
            <View>
                <Text>Loading...</Text>
            </View>
        )
    }

    if (state.error) {
        return (
            <View>
                <Text>Error: {state.error}</Text>
            </View>
        )
    }

    const renderReview = ({ item }) => (
        <View style={styles.reviewContainer}>
            <Text style={styles.rating}>Rating: {item.rating}</Text>
            <Text style={styles.text}>{item.text}</Text>
            <Text style={styles.user}>
                {userNames[item.user_id] 
                    ? `User: ${userNames[item.user_id]}`  
                    : `User: Loading user...`}  
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {state.reviewsData.length === 0 ? (
                <Text>There are no reviews yet. Be the first to leave a review!</Text>
            ) : (
                <FlatList
                    data={state.reviewsData}
                    renderItem={renderReview}
                    keyExtractor={(item) => item.id.toString()}
                    initialNumToRender={3}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    reviewContainer: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
    rating: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    text: {
        color: 'black',
        marginBottom: 5,
    },
    user: {
        fontStyle: 'italic',
        color: 'gray',
    },
});

export default Reviews;