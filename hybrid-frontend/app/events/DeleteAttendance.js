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
import * as SecureStore from 'expo-secure-store';
import { BACKEND_URL } from '@env';
import Toast from 'react-native-toast-message';

const DeleteAttendance = ({userId, eventId, filteredAttendances, cancelModalVisible, setCancelModalVisible, onAttendanceCanceled}) => {
    // const [reviewText, setReviewText] = useState('');
    // const [rating, setRating] = useState(0);


    const attendanceID = filteredAttendances.find(attendance => attendance.user_id === userId);

    const handleCancelAttendance = async () => {
		const storedToken = await SecureStore.getItemAsync('token');
		const token = storedToken.replace(/"/g, '')



        try {
            const response = await fetch(`http://${BACKEND_URL}/api/v1/attendances/${attendanceID.id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
              });

			if (response.ok) {
				onAttendanceCanceled();
			} else {
				console.error('Error deleting attendance');
			}

            // const data = await response.json();
            setCancelModalVisible(false);

        } catch (error) {
            console.error('Error canceling attendance:', error);
        }
    }

    return (
		<View style={styles.centeredView}>
			<Modal
				animationType='none'
				transparent={true}
				visible={cancelModalVisible}
				onRequestClose={() => {
					Alert.alert('Modal has been closed.');
					setCancelModalVisible(!cancelModalVisible)
				}}
			>
				<View syle={styles.centeredView}>
					<View style={styles.modalView}>
						<Text style={styles.modalText}>
							Cancel attendance to this event?
						</Text>
						<View style={styles.buttonContainer}>
							<Pressable 
								style={[styles.button, styles.buttonClose]}
								onPress={handleCancelAttendance}
							>
								<Text>Cancel</Text>
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

export default DeleteAttendance;