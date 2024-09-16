import React from 'react';
import useAxios from 'axios-hooks';
import { Button, Typography } from '@mui/material';

const DeleteAttendance = ({ attendance_id, onClose, onAttendanceCancelled, onShowSnackbar }) => {
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
        executeDelete()
            .then(() => {
                onShowSnackbar('Attendance cancelled successfully.');
                onAttendanceCancelled();
                onClose();
            })
            .catch((error) => {
                console.error("Error cancelling attendance:", error);
                onShowSnackbar('Failed to cancel attendance.');
            });
    };

    return (
        <>
            <Typography variant="body1">Are you sure you want to cancel your attendance?</Typography>
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
