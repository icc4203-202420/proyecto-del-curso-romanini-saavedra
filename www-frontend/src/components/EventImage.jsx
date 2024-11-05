import React, { useEffect, useState } from 'react';
import useAxios from 'axios-hooks';
import { Typography, Card, CardContent, Box, CardMedia, Button } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom';
import {useUser} from '../context/UserContext';
import axios from 'axios';

const EventImage = ({picture}) => {
    const {user} = useUser();
    const navigate= useNavigate();
    const [tagsData, setTagsData] = useState([]);

    const [{ data: userData, loading, error}] = useAxios({
        url: `http://127.0.0.1:3000/api/v1/users/${picture.user_id}`,
        method: 'GET'
    })

    // const [{ data: tagsData}, refetchTagsData] = useAxios({
    //     url: `http://127.0.0.1:3001/api/v1/tag_users`,
    //     method: 'GET'
    // })

    const fetchTagsData = async () => {
        const response = await axios.get(`http://127.0.0.1:3000/api/v1/tag_users`);
        setTagsData(response.data);
    }

    useEffect(() => {
        fetchTagsData();
    }, []);

    const handleTagAdded = () => {
        fetchTagsData();
    }


    const taggedUsersForPicture = tagsData?.tag_users?.filter(tag => parseInt(tag.picture_id) === parseInt(picture.id))

    const displayedTags = new Set();

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
                                    // onClick={() => {
                                    //     console.log("Button clicked, userId:", user.id, "pictureId:", picture.id);
                                    // }}
                                    onClick={handleTagAdded}
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
                            {taggedUsersForPicture?.map(tag => {
                                const tagKey = `${tag.user_id}-${tag.tagged_user_id}`;

                                if (displayedTags.has(tagKey)) {
                                    return null;
                                }

                                displayedTags.add(tagKey);

                                return (
                                    <GetTaggedUsers 
                                        key={tagKey} 
                                        userId={tag.user_id} 
                                        taggedUserId={tag.tagged_user_id} 
                                    />
                                )
                            })}
                        </CardContent>
                    </Card>
            </Box>
        )  
    );  
};

const GetTaggedUsers = ({userId, taggedUserId}) => {
    const [{ data: userData}] = useAxios({
        url: `http://127.0.0.1:3000/api/v1/users/${userId}`,
        method: 'GET'
    })

    const [{ data: taggedUserData}] = useAxios({
        url: `http://127.0.0.1:3000/api/v1/users/${taggedUserId}`,
        method: 'GET'
    })

    return (
        <div>
            {userData && taggedUserData && (
                <Box mb={2}>
                    <Card variant="outlined" sx={{ display: 'flex', alignItems: 'center', padding: 1 }}>
                        <CardContent sx={{ flex: 1, padding: 0 }}>
                            <Typography variant="body2" color="textSecondary" textAlign='left'>
                                {userData.user.handle} tagged {taggedUserData.user.handle}
                            </Typography>
                        </CardContent >
                    </Card>
                </Box>
            )}
        </div>
    )
}

export default EventImage;