import React, { useEffect, useState } from 'react';
import useAxios from 'axios-hooks';
import {Typography, Card, CardContent, Box} from '@mui/material'

const EventPictureGallery = ({eventId, images}) => {
    console.log("EVENT ID:", eventId)
    const [{ data: eventPictureData, loading: eventPictureDataLoading, error: eventPictureDataError }] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/event_pictures?event_id=${eventId}`,
        method: 'GET'
    })

    if(eventPictureDataLoading) {
        return <Typography>Loading...</Typography>
    }

    if (eventPictureDataError) {
        return <Typography>Error fetching event pictures.</Typography>
    }

    console.log("EVENT PICTURE DATA:", eventPictureData);

    return (
        <div>
            {eventPictureData && (
                eventPictureData.map((picture) => (
                    <div key={picture.id}>
                        <img src={picture.image_url} alt={picture.description}/>
                        <p>{picture.description}</p>
                    </div>
                ))
            )}
            {/* {console.log("eventPictureData.length:", eventPictureData.length)}
            {parseInt(eventPictureData).length > 0 ? (
                eventPictureData.map((picture) => (
                    <div key={picture.id}>
                        <img src={picture.image_url} alt={picture.description}/>
                        <p>{picture.description}</p>
                    </div>
                ))

            ) : (
                <Typography>No pictures found for this event</Typography>
            )} */}
            {/* {eventPictureData && (
                eventPictureData.map((picture) => (
                    <div key={picture.id}>
                        <img
                            src={picture.image_url}
                            alt={picture.description}
                        />
                        <p>{picture.description}</p>

                    </div>
                ))
                
            )} */}
        </div>
    )

    
};


export default EventPictureGallery;