import React, { useEffect, useState } from 'react';
import {Link} from 'react-router-dom';
import useAxios from 'axios-hooks';
import useLocalStorageState from 'use-local-storage-state';
import { Autocomplete, TextField, List, ListItem, ListItemText, Button, Card, CardMedia, CardActions, CardContent, Typography, Box } from '@mui/material'
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const TagUsers = () => {

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get('userId')
    const pictureId = queryParams.get('pictureId');
    // const { userId, pictureId } = location.state || {};

    const [searchKeywords, setSearchKeywords] = useState('')
    const [usersData, setUsersData] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    
    const [keywordList, setKeywordList] = useLocalStorageState('BeerMates/SearchFriendships/KeywordList', {
        defaultValue: []
    })



    console.log("userId:", userId)
    console.log("pictureId:", pictureId)


    const aux_token = localStorage.getItem('app-token');
    const token = aux_token.replace(/"/g, '');


    const [{data: friendshipsData, loading, error}, execute] = useAxios(
        {
            url: `http://127.0.0.1:3001/api/v1/users/${userId}/friendships`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        },
        {manual: true}
    );

    useEffect(() => {
        if (userId) {
            execute();
        }
    }, [userId, execute]);

    useEffect(() => {
        if (friendshipsData) {
            const fetchUserDetails = async () => {
                const usersPromises = friendshipsData.map(friendship => 
                    axios.get(`http://127.0.0.1:3001/api/v1/users/${friendship.friend_id}`)
                );
                const usersResponses = await Promise.all(usersPromises);
                const users = usersResponses.map(response => response.data);
                setUsersData(users);
            };
            fetchUserDetails();
        }
    }, [friendshipsData]);

    useEffect(() => {
        if (searchKeywords) {
            const filtered = usersData.filter(user =>
                user.handle.toLowerCase().includes(searchKeywords.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(usersData);
        }
    }, [searchKeywords, usersData]);

    const handleInputChange = (event, newInputValue) => {
        setSearchKeywords(newInputValue);
    };



    
    console.log("friendships DAta:", friendshipsData)

    const handleTagUser = async (friendId) => {
        try {
            const response = await axios.post(`http://127.0.0.1:3001/api/v1/tag_users`, {
                tagged_user_id: friendId,
                user_id: userId,
                picture_id: pictureId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("User tagged successfully:", response.data);
        } catch (error) {
            console.error("Error tagging user:", error);
        }
    };
    

    return (
        
        <Box display='flex' flexDirection="column" minHeight="100vh">
            <Box mb={2}>
                <Autocomplete
                    freeSolo
                    options={usersData.map(user => user.handle)}
                    value={searchKeywords}
                    onInputChange={handleInputChange}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search Friends"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            sx={{
                                width: '200px',
                                height: '56px'
                            }}
                        />
                    )}
                />
            </Box>
            <Box flex="1">
                {loading && (
                    <Typography variant="body1" margin="normal">
                        Loading friends...
                    </Typography>
                )}
                {error && (
                    <Typography variant="body1" color="error" margin="noraml">
                        Error fetching data.
                    </Typography>
                )}
                {friendshipsData && (
                    friendshipsData.map((friendship) => (
                        <SingleUser 
                            key={friendship.id} 
                            userId={friendship.friend_id} 
                            onTagUser={() => handleTagUser(friendship.friend_id)}/>
                    ))
                )}
            </Box>
        </Box>
    );  
};

const SingleUser = ({userId, onTagUser}) => {
    const [{data: userData, loading, error}] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/users/${userId}`,
        method: 'GET'
    });

    const [isTagged, setIsTagged] = useState(false);

    const handleTagUser = async () => {
        await onTagUser();
        setIsTagged(true);
    }

    if (loading) return null;
    if (error) return <Typography>Error fetching data for user {userId}</Typography>;

    return (
        <div>
            {userData && (
                <Card
                    sx={{
                        width: 280,
                        height: 'auto',
                        maxHeight: 300,
                        overflow: 'auto',
                        marginBottom: 2,
                        backgroundColor: 'transparent',
                        borderRadius: 4
                    }}
                >
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexGrow: 1 }}>
                        <Typography variant="h5" component="div" textAlign="center">
                            {userData.user.handle}
                        </Typography>
                        <Button 
                            variant="contained" 
                            onClick={handleTagUser}
                            sx={{ backgroundColor: isTagged ? 'green' : 'default' }}
                        >
                            {isTagged ? 'Tagged' : 'Tag'}
                        </Button>
                    </CardContent>

                </Card>
            )}
        </div>
    )
}

export default TagUsers;