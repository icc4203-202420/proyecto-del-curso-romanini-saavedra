import React, { useEffect, useState } from 'react';
import { useParams} from 'react-router-dom';
import useAxios from 'axios-hooks';
import { Dialog, DialogActions, DialogContent, DialogTitle, Tabs, Tab, Button, Card, CardContent, CardMedia, Typography, Box, Pagination } from '@mui/material'
import beerBottleIcon from '../assets/images/beer_bottle_icon.png'
import StarIcon from '@mui/icons-material/Star';
import ReviewsList from './ReviewsList'
import CreateReview from './CreateReview'
import BarsBeers from './BarsBeers'
import {useUser} from '../context/UserContext';
import CreateAttendance from './CreateAttendance';
import EventUsers from './EventUsers';
import DeleteAttendance from './DeleteAttendance';

const Event = () => {
    const {user, isAuthenticated} = useUser();
    const {event_id} = useParams();
    const [tabIndex, setTabIndex] = useState(0);
    const [open, setOpen] = useState(false);
    const [loginPromptOpen, setLoginPromptOpen] = useState(false);
    const [isAttending, setIsAttending] = useState(false);
    const [attendanceId, setAttendanceId] = useState(null);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleClickOpen = () => {
        if (isAuthenticated) {
            setOpen(true);
        } else {
            setLoginPromptOpen(true);
        }
    };

    const handleClose = () => {
        setOpen(false);
    }

    const handleLoginPromptClose = () => {
        setLoginPromptOpen(false);
    };

    const handleAttendanceCreated = () => {
        refetchAttendanceData().then(() => {
            checkAttendanceStatus();
            setOpen(false);
        })
    }

    const handleAttendanceCancelled = () => {
        refetchAttendanceData().then(() => {
            checkAttendanceStatus();
            setOpen(false);
        })
    }

    const [{ data: eventData, loading, error }, refetchEventData] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/events/${event_id}`,
        method: 'GET'
    })

    const [{ data: attendanceData }, refetchAttendanceData] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/attendances`,
        method: 'GET'
    })

    console.log("EVENT DATA:", eventData);
    console.log("ATTENDANCE DATA:", attendanceData);

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

    useEffect(() => {
        if (user) {
            checkAttendanceStatus();
        }
    }, [user, attendanceData]);

    return (
        <div>
            {loading && (
                <Typography variant="body1" margin="normal">
                    Loading event data...
                </Typography>
            )}
            {error && (
                <Typography variant="body1" color="error" margin="normal">
                    Error fetching event data.
                </Typography>
            )}
            {eventData && (
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
                                    left: 16,
                                    zIndex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-start',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <Typography variant="h4" component="div" sx={{color: 'black', fontWeight: 'bold', textAlign: 'left'}}>
                                    {eventData.event.name}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                    <Box display="flex" justifyContent="left" my={2}>
                        <Button
                            variant="outlined"
                            startIcon={<StarIcon/>}
                            sx={{borderRadius: 2}}
                            onClick={handleClickOpen}
                            color="black"
                        >
                            {isAttending ? 'Cancel Attendance' : 'Confirm Attendance'}
                        </Button>
                    </Box>
                    <Dialog open={open} onClose={handleClose}>
                        <DialogTitle>{isAttending ? 'Cancel Attendance' : 'Confirm Attendance'}</DialogTitle>
                        <DialogContent>
                            {isAttending ? (
                                <DeleteAttendance
                                    event_id={eventData.event.id}
                                    attendance_id={attendanceId}
                                    onClose={handleClose}
                                    onAttendanceCancelled={handleAttendanceCancelled}
                                />
                            ) : (
                                <CreateAttendance
                                    event_id={eventData.event.id}
                                    onClose={handleClose}
                                    onAttendanceCreated={handleAttendanceCreated}
                                />
                            )}

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={loginPromptOpen} onClose={handleLoginPromptClose}>
                        <DialogTitle>Please Log In</DialogTitle>
                        <DialogContent>
                            You need to be logged in to confirm attendance to an event. Please log in or create an account.
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
                        </Box>   
                    )}
                    {tabIndex === 1 && (
                        <Box>
                            <Typography>
                                There are no photos for this event.
                            </Typography>
                        </Box>
                    )}
                    {tabIndex === 2 && (
                        <Box>
                            <EventUsers event_id={eventData.event.id}/>
                        </Box>
                    )}
                </Box>
            )}
        </div>
    )
};

export default Event;
