import React, {useEffect, useState} from 'react';
import useAxios from 'axios-hooks';
import { Dialog, Slider, TextField, Button, Typography, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import {useUser} from '../context/UserContext';
import Reviews from './Reviews';

const CreateAttendance = ({event_id, onClose, onAttendanceCreated}) => {
    const { user } = useUser();
    const [attendance, setAttendance] = useState();

    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [openAttendanceDialog, setOpenAttendanceDialog] = useState(true);
    
    const aux_token = localStorage.getItem('app-token');
    const token = aux_token.replace(/"/g, '');

    const [{ loading, error}, executePost] = useAxios(
        {
            url: `http://127.0.0.1:3001/api/v1/attendances`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        },
        {manual: true}
    );

    const handleAttendanceChange = (event) => {
        const {name, value} = event.target;
        setAttendance({...attendance, [name]: value});
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        executePost({
            data: {
                attendance: {
                    ...attendance,
                    user_id: user.id,
                    event_id: event_id
                }
            }
        }).then((response) => {
            setOpenAttendanceDialog(false);
            setOpenSuccessDialog(true);
            if (onAttendanceCreated) onAttendanceCreated();
            console.log("Attendance created successfully", response.data);
        }).catch((error) => {
            console.error("Error creating attendance:", error);
        });
    };

    const handleCloseSuccessDialog = () => {
        setOpenSuccessDialog(false);
        if(onClose) onClose();
    }

    const handleCancel = () => {
        setOpenAttendanceDialog(false);
        if (onClose) onClose();
    }

    return (
    <>
        <Dialog open={openAttendanceDialog} onClose={handleCancel}>
            <DialogTitle>Confirm Attendance?</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit} style={{width: 300, margin: 'auto'}}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Send'}
                    </Button>
                    {error && <Typography color="error">Failed to confirm attendance</Typography>}
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} color="secondary">Cancel</Button>
            </DialogActions>
        </Dialog>

        <Dialog open={openSuccessDialog} onClose={handleCloseSuccessDialog}>
            <DialogTitle>Success</DialogTitle>
            <DialogContent>
                <Typography variant="h6">Attendance confirmed successfully!</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseSuccessDialog} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    </>
    )

};

export default CreateAttendance;