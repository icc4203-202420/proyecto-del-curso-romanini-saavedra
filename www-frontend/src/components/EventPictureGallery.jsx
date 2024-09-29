import React from 'react';
import { Box } from '@mui/material'
import EventImage from './EventImage';

const EventPictureGallery = ({eventId, eventPictureData}) => {
    return (
        <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
            {eventPictureData.map((picture) => (
                <EventImage picture={picture}/>
            ))}
        </Box>
    );
    
};

export default EventPictureGallery;