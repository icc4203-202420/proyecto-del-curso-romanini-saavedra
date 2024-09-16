import React, { useState } from 'react';
import useAxios from 'axios-hooks';
import { Button, Typography } from '@mui/material';
import { useUser } from '../context/UserContext';

const CreateAttendance = ({ event_id, onAttendanceCreated, onShowSnackbar }) => {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    const aux_token = localStorage.getItem('app-token');
    const token = aux_token.replace(/"/g, '');

    const [{ error }, executePost] = useAxios(
        {
            url: `http://127.0.0.1:3001/api/v1/attendances`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        },
        { manual: true }
    );

    const handleSubmit = (event) => {
        event.preventDefault();
        setLoading(true);

        executePost({
            data: {
                attendance: {
                    user_id: user.id,
                    event_id: event_id
                }
            }
        })
        .then(() => {
            onShowSnackbar('Attendance confirmed successfully!');
            onAttendanceCreated();
        })
        .catch(() => {
            onShowSnackbar('Failed to confirm attendance.');
        })
        .finally(() => {
            setLoading(false);
        });
    };

    return (
        <div style={{ width: 250, margin: 'auto', padding: 16 }}>
            <form onSubmit={handleSubmit}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    fullWidth
                >
                    {loading ? 'Submitting...' : 'Submit'}
                </Button>
                {error && (
                    <Typography color="error">Failed to confirm attendance</Typography>
                )}
            </form>
        </div>
    );
};

export default CreateAttendance;
