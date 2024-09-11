import React, { useState } from 'react';
import { useParams} from 'react-router-dom';
import useAxios from 'axios-hooks';
import { Dialog, DialogActions, DialogContent, DialogTitle, Tabs, Tab, Button, Card, CardContent, CardMedia, Typography, Box, Pagination } from '@mui/material'
import beerBottleIcon from '../assets/images/beer_bottle_icon.png'
import StarIcon from '@mui/icons-material/Star';
import ReviewsList from './ReviewsList'
import CreateReview from './CreateReview'
import BarsBeers from './BarsBeers'
import {useUser} from '../context/UserContext';

const Event = () => {
    const {user, isAuthenticated} = useUser();
    const {event_id} = useParams();
    const [tabIndex, setTabIndex] = useState(0);
    const [open, setOpen] = useState(false);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleClickOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const [{ data: eventData, loading, error }, refetchEventData] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/events/${event_id}`,
        method: 'GET'
    })

    console.log("EVENT DATA:", eventData);

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
                        <Card
                            sx={{
                                backgroundColor: 'transparent',
                                boxShadow: 'none',
                                border: 'none',
                                position: 'relative'
                            }}
                        >
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
                            Confirm Attendance
                        </Button>
                    </Box>
                    <Dialog open={open} onClose={handleClose}>
                        <DialogTitle>Confirm attendance?</DialogTitle>
                        {/* <DialogContent>

                        </DialogContent> */}
                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
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
                            <Typography>
                                Aca va la informacion del evento
                            </Typography>
                        </Box>
                    )}
                    {tabIndex === 1 && (
                        <Box>
                            <Typography>
                                Aca van las fotos del evento
                            </Typography>
                        </Box>
                    )}
                    {tabIndex === 2 && (
                        <Box>
                            <Typography>
                                Aca van las personas
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}
        </div>
    )
};

export default Event;
