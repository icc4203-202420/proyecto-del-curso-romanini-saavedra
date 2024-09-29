import React from 'react';
import useAxios from 'axios-hooks';
import { Typography, Card, CardContent, Box, CardMedia, Button } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom';

const EventImage = ({picture}) => {
    const navigate = useNavigate();

    // const handleButtonClick = () => {
    //     navigate(`http://127.0.0.1:3001/api/v1/tag_users`)
    // }

    const [{ data: userData, loading, error}] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/users/${picture.user_id}`,
        method: 'GET'
    })

    return (
        userData && (
            <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                <Card key={picture.id} sx={{ margin: 2 }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2" color="textSecondary" >
                                    Uploaded by: {userData.user.handle}
                                </Typography>
                                
                                <Button 
                                    component={Link}
                                    to={`/tag_users`}
                                    variant="contained"  
                                    size="small" 
                                    color="primary"
                                >
                                    Tag
                                </Button>
                            
                            </Box>
                                
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