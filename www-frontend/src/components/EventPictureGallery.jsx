import React from 'react';
import { Box, Typography } from '@mui/material'
import EventImage from './EventImage';

const EventPictureGallery = ({eventId, eventPictureData}) => {
    return (
        <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
            {eventPictureData.length === 0 ? (
                <Typography variant="body1" color="textSecondary">
                    Be the first to upload a picture!
                </Typography>
            ) : (
                eventPictureData.map((picture) => (
                    <EventImage picture={picture}/>
                ))

            )}
        </Box>
    );
    
};

export default EventPictureGallery;