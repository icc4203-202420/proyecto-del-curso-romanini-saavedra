import React from 'react';
import useAxios from 'axios-hooks';
import {Button, Typography} from '@mui/material';
import {useUser} from '../context/UserContext';

const DeleteAttendance = ({event_id, attendance_id, onClose, onAttendanceCancelled}) => {
    const {user} = useUser();

    const aux_token = localStorage.getItem('app-token');
    const token = aux_token.replace(/"/g, '');

    const [{ loading, error }, executeDelete] = useAxios(
        {
            url: `http://127.0.0.1:3001/api/v1/attendances/${attendance_id}`,
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        },
        { manual: true }
    );

    const handleDelete = () => {
        executeDelete().then(() => {
            onAttendanceCancelled();
            onClose();
        }).catch((error) => {
            console.error("Error cancelling attendance:", error);
        });
    };

    return (
        <>
            <Typography variant="h6">Are you sure you want to cancel your attendance?</Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={handleDelete}
                disabled={loading}
            >
                {loading ? 'Processing...' : 'Cancel Attendance'}
            </Button>
            {error && <Typography color="error">{error.message || 'Failed to cancel attendance'}</Typography>}
        </>
    );

    

};

export default DeleteAttendance;