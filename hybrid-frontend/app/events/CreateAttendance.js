import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { BACKEND_URL } from '@env';
import Toast from 'react-native-toast-message';

const CreateAttendance = ({ userId, eventId, modalVisible, setModalVisible, onAttendanceCreated }) => {
    const handleSubmitAttendance = async () => {
        const storedToken = await SecureStore.getItemAsync('token');
        const token = storedToken.replace(/"/g, '');

        const body = {
            attendance: {
                user_id: userId,
                event_id: eventId,
                checked_in: true,
            },
        };

        try {
            const response = await fetch(`http://${BACKEND_URL}/api/v1/attendances`, {
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
                    text1: 'Attendance confirmed successfully',
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
    };

    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                Alert.alert('Modal has been closed.');
                setModalVisible(!modalVisible);
            }}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>
                        Confirm attendance to this event?
                    </Text>
                    <View style={styles.buttonContainer}>
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.textStyle}>Close</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={handleSubmitAttendance}
                        >
                            <Text style={styles.textStyle}>Confirm</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    button: {
        borderRadius: 5,
        padding: 10,
        elevation: 2,
        marginHorizontal: 5,
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
        fontSize: 24,
    },
});

export default CreateAttendance;
