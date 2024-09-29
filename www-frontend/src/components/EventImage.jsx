import React from 'react';
import useAxios from 'axios-hooks';
import { Typography, Card, CardContent, Box, CardMedia, Button } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom';
import {useUser} from '../context/UserContext';

const EventImage = ({picture}) => {
    const {user} = useUser();

    const [{ data: userData, loading, error}] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/users/${picture.user_id}`,
        method: 'GET'
    })

    const [{ data: tagsData}] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/tag_users`,
        method: 'GET'
    })

    console.log("TAGGED USERS DATA:", tagsData)

    const taggedUsersForPicture = tagsData?.tag_users?.filter(tag => parseInt(tag.picture_id) === parseInt(picture.id))

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
                                    to={`/tag_users?userId=${user.id}&pictureId=${picture.id}`}
                                    variant="contained"  
                                    size="small" 
                                    color="primary"
                                    onClick={() => {
                                        console.log("Button clicked, userId:", user.id, "pictureId:", picture.id);
                                    }}
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
                            <Typography variant="body1">{picture.description}</Typography>
                            {taggedUsersForPicture?.map(tag => (
                                <GetTaggedUsers userId={tag.user_id} taggedUserId={tag.tagged_user_id}/>
                            ))}
                        </CardContent>
                    </Card>
            </Box>
        )  
    );  
};

const GetTaggedUsers = ({userId, taggedUserId}) => {
    const [{ data: userData}] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/users/${userId}`,
        method: 'GET'
    })

    const [{ data: taggedUserData}] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/users/${taggedUserId}`,
        method: 'GET'
    })

    return (
        <div>
            {userData && taggedUserData && (
                <Typography variant="body2" color="textSecondary" textAlign='left'>
                    {userData.user.handle} tagged {taggedUserData.user.handle}
                </Typography>
            )}
        </div>
    )
}

export default EventImage;