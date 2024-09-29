import React from 'react';
import useAxios from 'axios-hooks';
import { Typography, Card, CardContent, Box, CardMedia } from '@mui/material'

const EventImage = ({picture}) => {
    console.log("PICTURE:", picture)

    const [{ data: userData, loading, error}] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/users/${picture.user_id}`,
        method: 'GET'
    })

    return (
        userData && (
            <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                <Card key={picture.id} sx={{ margin: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">
                                Uploaded by: {userData.user.handle}
                            </Typography>
                        </CardContent>
                        <CardMedia
                            component="img"
                            image={picture.image_url}
                            alt={picture.description}
                            sx={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '300px', 
                                objectFit: 'cover' 
                            }}
                        />
                        <CardContent>
                            <Typography variant="body2">{picture.description}</Typography>
                        </CardContent>
                    </Card>
            </Box>
        )  
    );  
};

export default EventImage;