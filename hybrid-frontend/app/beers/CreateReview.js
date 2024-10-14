import React, {useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    Alert,
    TextInput
} from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateReview = ({userId, beerId, modalVisible, setModalVisible, onReviewCreated}) => {
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(0);

	const countWords = (text) => {
		return text.trim().split(/\s+/).length;
	};

    const handleSubmitReview = async () => {
		if (!reviewText || rating === 0) {
			Alert.alert('Please provide a comment and a rating.')
			return;
		}

		const wordCount = countWords(reviewText);

		if (wordCount < 15) {
			Alert.alert('The review text must have at least 15 words.')
			return;
		}

		const storedToken = await AsyncStorage.getItem('token');
		const token = storedToken.replace(/"/g, '')

		const body = {
			review: {
				text: reviewText,
				rating: parseFloat(rating.toFixed(1)),
				user_id: userId,
				beer_id: beerId,
			}
		};

        try {
            const response = await fetch(`http://10.33.0.134:3000/api/v1/beers/${beerId}/reviews`, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
				body: JSON.stringify(body),
              });

			if (response.ok) {
				onReviewCreated();
			} else {
				console.error('Error submitting review');
			}

			const data = await response.json();
			setModalVisible(false);

        } catch (error) {
            console.error('Error submitting review:', error);
			Alert.alert('Error submitting review:', error.message);
        }
    }

    return (
        <View style={styles.centeredView}>
            <Modal
                animationType="none"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    setModalVisible(!modalVisible)
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Review this beer</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Add a comment"
                            value={reviewText}
                            onChangeText={setReviewText}
                            multiline
                            numberOfLines={4}
                        />
                        <Text style={styles.ratingText}>Rating: {rating.toFixed(1)}</Text>
                        <Slider
                            style={{ width: 300, height: 40 }}
                            minimumValue={1}
                            maximumValue={5}
                            step={0.1}
                            value={rating}
                            onValueChange={(value) => setRating(parseFloat(value.toFixed(1)))}
                            minimumTrackTintColor="#1EB1FC"
                            maximumTrackTintColor="#d3d3d3"
                        />
						<View style={styles.buttonContainer}>
							<Pressable
								style={[styles.button, styles.buttonClose]}
								onPress={() => setModalVisible(false)}
							>
								<Text>Close</Text>
							</Pressable>
							<Pressable
								style={[styles.button, styles.buttonClose]}
								onPress={handleSubmitReview}
							>
								<Text>Submit review</Text>

							</Pressable>
						</View>
                    </View>
                </View>

            </Modal>
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
      buttonContainer: {
        top: 10,
        width: 300,
		flexDirection: 'row'
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
      ratingText: {
        marginBottom: 15,
        textAlign: 'center',
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

export default CreateReview;