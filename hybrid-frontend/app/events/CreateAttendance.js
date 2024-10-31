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
import { BACKEND_URL } from '@env';
import Toast from 'react-native-toast-message';

const CreateAttendance = ({userId, eventId, modalVisible, setModalVisible, onAttendanceCreated}) => {
    // const [reviewText, setReviewText] = useState('');
    // const [rating, setRating] = useState(0);


    const handleSubmitAttendance = async () => {
		const storedToken = await AsyncStorage.getItem('token');
		const token = storedToken.replace(/"/g, '')

		const body = {
			attendance: {
				user_id: userId,
				event_id: eventId,
				checked_in: true
			}
		};

        try {
            const response = await fetch(`${BACKEND_URL}/api/v1/attendances`, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
				body: JSON.stringify(body),
              });

			if (response.ok) {
				onAttendanceCreated();
        Toast.show({
          type: 'success',
          text1: 'Attendance confirmed successfully'
        });
			} else {
				console.error('Error submitting attendance');
			}

			const data = await response.json();
			setModalVisible(false);

        } catch (error) {
            console.error('Error submitting attendance:', error);
			      Alert.alert('Error submitting attendance:', error.message);
        }
    }

    return (
		<View style={styles.centeredView}>
			<Modal
				animationType='none'
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => {
					Alert.alert('Modal has been closed.');
					setModalVisible(!modalVisible)
				}}
			>
				<View syle={styles.centeredView}>
					<View style={styles.modalView}>
						<Text style={styles.modalText}>
							Confirm attendance to this event?
						</Text>
						<View style={styles.buttonContainer}>
              <Pressable
								style={[styles.button, styles.buttonClose]}
								onPress={() => setModalVisible(false)}
							>
								<Text>Close</Text>
              </Pressable>
							<Pressable 
								style={[styles.button, styles.buttonClose]}
								onPress={handleSubmitAttendance}
							>
								<Text>Confirm</Text>
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
        borderRadius: 5,
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
        fontWeight: 'bold',
        fontSize: 24
      },
})

export default CreateAttendance;