import React, { useEffect, useState } from 'react';
import {Link} from 'react-router-dom';
import useAxios from 'axios-hooks';
import useLocalStorageState from 'use-local-storage-state';
import { IconButton, Autocomplete, TextField, List, ListItem, ListItemText, Button, Card, CardMedia, CardActions, CardContent, Typography, Box } from '@mui/material'
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TagUsers = ({onTagAdded}) => {

    const navigate = useNavigate();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get('userId')
    const pictureId = queryParams.get('pictureId');

    const [searchKeywords, setSearchKeywords] = useState('')
    const [usersData, setUsersData] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    const [selectedUser, setSelectedUser] = useState(null);
    
    const [keywordList, setKeywordList] = useLocalStorageState('BeerMates/SearchFriendships/KeywordList', {
        defaultValue: []
    })

    // console.log("userId:", userId)
    // console.log("pictureId:", pictureId)


    const aux_token = localStorage.getItem('app-token');
    const token = aux_token.replace(/"/g, '');


    const [{data: friendshipsData, loading, error}, execute] = useAxios(
        {
            url: `http://127.0.0.1:3000/api/v1/users/${userId}/friendships`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        },
        {manual: true}
    );

    useEffect(() => {
        window.scrollTo(0,0)
    }, []);

    useEffect(() => {
        if (userId) {
            execute();
        }
    }, [userId, execute]);

    useEffect(() => {
        console.log("ESTO ES FRIENDSHIP DATA:", friendshipsData)
        if (friendshipsData) {
            const fetchUserDetails = async () => {
                const usersPromises = friendshipsData.map(friendship => 
                    axios.get(`http://127.0.0.1:3000/api/v1/users/${friendship.friend_id}`)
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
            console.log("ESTO ES USER:", usersData)
            const filtered = usersData?.filter(user =>
                user.user.handle.toLowerCase().includes(searchKeywords.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers([]);
        }
    }, [searchKeywords, usersData]);

    const handleInputChange = (event, newInputValue) => {
        setSearchKeywords(newInputValue);

    };

    const handleBackClick = () => {
        navigate(-1);
    }
  
    const handleUserSelect = (newValue) => {
        const user = filteredUsers.find(user => user.user.handle === newValue);
        if (user) {
            setSelectedUser(user);
        } else {
            setSelectedUser(null);
        }
    };
    
    // console.log("friendships DAta:", friendshipsData)

    const handleTagUser = async (friendId) => {
        try {
            const response = await axios.post(`http://127.0.0.1:3000/api/v1/tag_users`, {
                tagged_user_id: friendId,
                user_id: userId,
                picture_id: pictureId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (onTagAdded) onTagAdded();
            console.log("User tagged successfully:", response.data);
            
        } catch (error) {
            console.error("Error tagging user:", error);
        }
    };

    return (
        <Box display='flex' flexDirection="column" minHeight="100vh">
            <Box display="flex" alignItems="center" mb={2}>
                <IconButton onClick={handleBackClick}>
                    <ArrowBack/>
                </IconButton>
                <Autocomplete
                    freeSolo
                    options={filteredUsers.map(user => user.user.handle)}
                    value={searchKeywords}
                    onInputChange={(event, newInputValue) => setSearchKeywords(newInputValue)}
                    onChange={(event, newValue) => handleUserSelect(newValue)}
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
                    <Typography variant="body1" color="error" margin="normal">
                        Error fetching data.
                    </Typography>
                )}
                {friendshipsData && parseInt(friendshipsData.length) === 0 && (
                    <Typography>Add some friends so you can tag them!</Typography>
                )}
                {selectedUser && (
                    <SingleUser
                        userId={selectedUser.user.id}
                        onTagUser={() => handleTagUser(selectedUser.user.id)}
                    />
                )}
            </Box>
        </Box>
    );  
};

const SingleUser = ({userId, onTagUser}) => {
    const [{data: userData, loading, error}] = useAxios({
        url: `http://127.0.0.1:3000/api/v1/users/${userId}`,
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