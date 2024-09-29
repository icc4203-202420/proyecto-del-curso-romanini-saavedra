import React, { useEffect, useState, useRef } from 'react';
import { useParams} from 'react-router-dom';
import useAxios from 'axios-hooks';
import { Dialog, DialogActions, DialogContent, DialogTitle, Tabs, Tab, Button, Card, CardContent, Typography, Box } from '@mui/material'
import StarIcon from '@mui/icons-material/Star';
import {useUser} from '../context/UserContext';
import EventUsers from './EventUsers';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import ImageUploader from './ImageUploader';
import EventPictureGallery from './EventPictureGallery';

const Event = () => {
    const {user, isAuthenticated} = useUser();
    const {event_id} = useParams();
    const [tabIndex, setTabIndex] = useState(0);
    const [open, setOpen] = useState(false);
    const [loginPromptOpen, setLoginPromptOpen] = useState(false);
    const [isAttending, setIsAttending] = useState(false);
    const [attendanceId, setAttendanceId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');

    const [images, setImages] = useState([]);

    const [openUploadDialog, setOpenUploadDialog] = useState(false);

    const handleOpenUploadDialog = () => {
        setOpenUploadDialog(true);
    };

    const handleCloseUploadDialog = () => {
        setOpenUploadDialog(false);
    }

    const handleImageUpload = (newImage) => {
        setImages((prevImages) => [...prevImages, newImage]);
        handleCloseUploadDialog();
        refetchEventPictureData();
    }

    const handleTabChange = (event, newValue) => {
        if (!isAuthenticated && (newValue === 1 || newValue === 2)){
            setLoginPromptOpen(true);
        } else {
            setTabIndex(newValue);
        }
    };

    const handleLoginPromptClose = () => {
        setLoginPromptOpen(false);
    };

    const handleAttendanceCreated = () => {
        refetchAttendanceData().then(() => {
            checkAttendanceStatus();
        })
    }

    const handleAttendanceCancelled = () => {
        refetchAttendanceData().then(() => {
            checkAttendanceStatus();
        })
    }

    const handleShowSnackbar = (message) => {
        setSnackBarMessage(message);
        setOpenSnackbar(true);
    }

    const [{ data: eventData, loading: eventLoading, error: eventError }, refetchEventData] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/events/${event_id}`,
        method: 'GET'
    })

    const [{ data: attendanceData }, refetchAttendanceData] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/attendances`,
        method: 'GET'
    })

    const [{ data: barData, loading: barLoading, error: barError }] = useAxios({
        url: eventData ? `http://127.0.0.1:3001/api/v1/bars/${eventData.event.bar_id}` : null,
        method: 'GET',
        manual: !eventData 
      });

    const [{ data: eventPictureData, loading: eventPictureDataLoading, error: eventPictureDataError }, refetchEventPictureData] = useAxios({
        url: eventData ? `http://127.0.0.1:3001/api/v1/event_pictures?event_id=${eventData.event.id}` : null,
        method: 'GET',
        manual: !eventData
    })

    const checkAttendanceStatus = () => {
        if (attendanceData && eventData && eventData.event) {
            const userAttendance = attendanceData.attendances.find(att => 
                parseInt(att.user_id) === parseInt(user.id) && 
                parseInt(att.event_id) === parseInt(eventData.event.id)
            );

            if (userAttendance){
                setAttendanceId(userAttendance.id);
                setIsAttending(true);
            } else {
                setIsAttending(false);
            }
            setIsAttending(!!userAttendance);
        } else {
            console.warn("attendanceData is not available or doesn't have the 'attendance' property.");
            setIsAttending(false); 
        }
    };

    const handleConfirmAttendance = () => {
        if (!isAuthenticated) {
            setLoginPromptOpen(true);
            return;
        }

        const aux_token = localStorage.getItem('app-token');
        const token = aux_token.replace(/"/g, '');
        setLoading(true);

        axios.post(`http://127.0.0.1:3001/api/v1/attendances`, {
            attendance: {
                user_id: user.id,
                event_id: eventData.event.id
            }
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(() => {
            handleAttendanceCreated();
            handleShowSnackbar('Attendance confirmed successfully!');
        })
        .catch(() => {
            handleShowSnackbar('Failed to confirm attendance.');
        })
        .finally(() => {
            setLoading(false);
        });
    }

    const handleCancelAttendance = () => {
        if (!isAuthenticated) {
            setLoginPromptOpen(true);
            return;
        }
        
        const aux_token = localStorage.getItem('app-token');
        const token = aux_token.replace(/"/g, '');
        setLoading(true);

        axios.delete(`http://127.0.0.1:3001/api/v1/attendances/${attendanceId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(() => {
            handleAttendanceCancelled();
            handleShowSnackbar('Attendance canceled successfully!');
        })
        .catch(() => {
            handleShowSnackbar('Failed to cancel attendance.');
        })
        .finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        if (user) {
            checkAttendanceStatus();
        }
    }, [user, attendanceData]);

    return (
        <div>
            {eventLoading && (
                <Typography variant="body1" margin="normal">
                    Loading event data...
                </Typography>
            )}
            {eventError && (
                <Typography variant="body1" color="error" margin="normal">
                    Error fetching event data.
                </Typography>
            )}
            {eventData && barData && eventPictureData && (
                <Box
                    sx={{
                        maxWidth: 280,
                        margin: 'auto'
                    }}
                >
                    <Box position="relative" width="100%" height={300} mb={2}>
                        <Card>
                            <CardContent
                                sx={{
                                    position: 'absolute',
                                    top: 16, 
                                    zIndex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-start',
                                    alignItems: 'flex-start',
                                    textAlign: 'left'
                                }}
                            >
                                <Typography variant="h3" component="div" sx={{color: 'black', fontWeight: 'bold', textAlign: 'left'}}>
                                    {eventData.event.name}
                                </Typography>
                                <Typography variant="h6">
                                    {barData.name}
                                </Typography>
                                <Typography>
                                    {barData.address.line1}, {barData.address.line2}
                                </Typography>
                                <Typography>
                                    {barData.address.city}, {barData.address.country.name}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                    <Box display="flex" justifyContent="left" my={2}>
                        <Button
                            variant="outlined"
                            startIcon={<StarIcon/>}
                            sx={{borderRadius: 2}}
                            onClick={isAttending ? handleCancelAttendance : handleConfirmAttendance}
                            color="black"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (isAttending ? 'Cancel Attendance' : 'Confirm Attendance')}
                        </Button>
                    </Box>
                    <Dialog open={loginPromptOpen} onClose={handleLoginPromptClose}>
                        <DialogTitle>Please Log In</DialogTitle>
                        <DialogContent>
                            You need to be logged in to complete this action. Please log in or create an account.
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleLoginPromptClose}>Close</Button>
                        </DialogActions>
                    </Dialog>
                    <Tabs
                        value={tabIndex}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            marginBottom: 2,
                            '.MuiTab-root': {
                                color: 'black',
                            },
                            '.Multi-selected': {
                                color: 'black',
                            }
                        }}
                        TabIndicatorProps={{
                            style: {
                                backgroundColor: '#D4A017'
                            }
                        }}
                    >
                        <Tab label="Information"></Tab>
                        <Tab label="Photos"></Tab>
                        <Tab label="People"></Tab>
                    </Tabs>

                    {tabIndex === 0 && (
                        <Box>
                            <Typography variant="body1" gutterBottom textAlign="left" color="black">
                                <strong>Description: </strong>{eventData.event.description}
                            </Typography>
                            <Typography variant="body1" gutterBottom textAlign="left" color="black">
                                <strong>Date: </strong>{new Date(eventData.event.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </Typography>
                            <Typography variant="body1" gutterBottom textAlign="left" color="black">
                                <strong>Start Time: </strong>{new Date(eventData.event.start_date).toLocaleDateString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Typography>
                            <Typography variant="body1" gutterBottom textAlign="left" color="black">
                                <strong>End Time: </strong>{new Date(eventData.event.end_date).toLocaleDateString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Typography>
                        </Box>   
                    )}
                    {tabIndex === 1 && (
                        <Box>
                            <Button variant="contained" onClick={handleOpenUploadDialog}>
                                Add Picture
                            </Button>

                            <EventPictureGallery eventId={eventData.event.id} eventPictureData={eventPictureData}/>

                            <Dialog open={openUploadDialog} onClose={handleCloseUploadDialog} fullWidth maxWidth="sm">
                                <DialogTitle textAlign='center'>Upload a Picture</DialogTitle>
                                <DialogContent>
                                    <ImageUploader 
                                        eventId={eventData.event.id} 
                                        userId={user.id}
                                        onImageUpload={handleImageUpload}    
                                    />
                                </DialogContent>
                                <DialogActions>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', flexGrow: 1 }}>
                                        <Button onClick={handleCloseUploadDialog}>Cancel</Button>
                                    </Box>
                                </DialogActions>
                            </Dialog>
                        </Box>
                    )}
                    {tabIndex === 2 && (
                        <Box>
                            <EventUsers event_id={eventData.event.id}/>
                        </Box>
                    )}
                </Box>
            )}

            <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={(() => setOpenSnackbar(false))}>
                <Alert onClose={() => setOpenSnackbar(false)} severity={snackBarMessage.includes('Failed') ? 'error' : 'success'} sx={{ width: '100%' }}>
                    {snackBarMessage}
                </Alert>
            </Snackbar>
        </div>
    )
};

export default Event;