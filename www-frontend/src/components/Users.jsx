import React, { useState, useEffect } from 'react';
import useAxios from 'axios-hooks';
import axios from 'axios';
import useLocalStorageState from 'use-local-storage-state';
import {
  Autocomplete,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { Person as PersonIcon, Add as AddIcon } from '@mui/icons-material';
import { useUser } from '../context/UserContext';

const Users = () => {
  const { user, isAuthenticated } = useUser();
  const [searchKeywords, setSearchKeywords] = useState('');
  const [keywordList, setKeywordList] = useLocalStorageState('BeerMates/SearchBeer/KeywordList', {
    defaultValue: []
  });

  const [{ data: allUsersData, loading, error }] = useAxios({
    url: 'http://127.0.0.1:3001/api/v1/users',
    method: 'GET'
  });

  const [friendshipsData, setFriendshipsData] = useState(null);

  // Fetch friendships only when user is available
  useEffect(() => {
    if (user && user.id) {
        const aux_token = localStorage.getItem('app-token');
        const token = aux_token.replace(/"/g, '');
        axios.get(`http://127.0.0.1:3001/api/v1/users/${user.id}/friendships`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        .then((response) => {
            setFriendshipsData(response.data);
            console.log("response de frienships de usuario actual:", response.data)
        })
        .catch((error) => {
            console.error('Error fetching friendships:', error);
        });
    }
  }, [user]);

  const [open, setOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventOptions, setEventOptions] = useState([]);
  const [selectedBar, setSelectedBar] = useState(null);
  const [barOptions, setBarOptions] = useState([]);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);

  const [{ data: barData }] = useAxios({
    url: 'http://127.0.0.1:3001/api/v1/bars',
    method: 'GET'
  });

  useEffect(() => {
    if (barData) {
      setBarOptions(barData.bars);
    }
  }, [barData]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (selectedBar) {
        const response = await axios.get(`http://127.0.0.1:3001/api/v1/bars/${selectedBar.id}/events`);
        setEventOptions(response.data);
      }
    };

    fetchEvents();
  }, [selectedBar]);

  const handleInputChange = (event, newInputValue) => {
    setSearchKeywords(newInputValue);
  };

  const handleClickOpen = (userId) => {
    setSelectedUserId(userId);
    if (isAuthenticated) {
      setOpen(true);
    } else {
      setLoginPromptOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBar(null);
    setSelectedEvent(null);
    setEventOptions([]); // Limpiar opciones de eventos
  };

  const handleLoginPromptClose = () => {
    setLoginPromptOpen(false);
  };

  const handleFriendshipCreated = () => {
    const fetchFriendships = async () => {
        const aux_token = localStorage.getItem('app-token');
        const token = aux_token.replace(/"/g, '');
        try {
          const response = await axios.get(`http://127.0.0.1:3001/api/v1/users/${user.id}/friendships`, {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          });
          setFriendshipsData(response.data);
        } catch (error) {
          console.error('Error refetching friendships:', error);
        }
    };

    fetchFriendships();
    setOpenSuccessDialog(true); // Abrir el diálogo de éxito
    handleClose();
  };    

  const handleSubmitFriendship = async () => {
    const aux_token = localStorage.getItem('app-token');
    const token = aux_token.replace(/"/g, '');

    if (!token) {
        console.error("Token is not available");
        return;
    }

    try {
        const response = await axios.post('http://127.0.0.1:3001/api/v1/friendships', {
          friendship: {
            user_id: user.id,
            friend_id: selectedUserId,
            bar_id: selectedBar.id,
          }
        }, {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
    
        if (response.status === 201) {
          handleFriendshipCreated();
        }
    } catch (error) {
        console.error('Error creating friendship:', error.response ? error.response.data : error.message);
    }
  };

  const filteredUsers = allUsersData?.users?.filter(
    (u) =>
      user?.id && // Verificar si user está definido
      u.id !== user.id && // Excluir el usuario actual
      !friendshipsData?.some((friendship) => friendship.friend_id === u.id) && // Excluir amigos
      u.handle.toLowerCase().includes(searchKeywords.toLowerCase())
  );

  console.log("fitro: ", filteredUsers)

  const handleCloseSuccessDialog = () => {
    setOpenSuccessDialog(false); 
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" p={2}>
      <Box mb={2}>
        <Autocomplete
          freeSolo
          options={keywordList}
          value={searchKeywords}
          onInputChange={handleInputChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Users"
              variant="outlined"
              fullWidth
              margin="normal"
              sx={{ width: '200px', height: '56px' }}
            />
          )}
        />
      </Box>
      <Box flex="1">
        {loading && (
            <Typography variant="body1" margin="normal">
            Searching for users...
            </Typography>
        )}
        {error && (
            <Typography variant="body1" color="error" margin="normal">
            Error fetching data...
            </Typography>
        )}
        {allUsersData && (
            <List>
            {(searchKeywords ? filteredUsers : allUsersData.users).length === 0 && !isAuthenticated ? 
                allUsersData.users.map((user, index) => (
                <ListItem key={index} sx={{ justifyContent: 'space-between' }}>
                    <Box display="flex" alignItems="center">
                    <ListItemAvatar>
                        <Avatar>
                        <PersonIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={user.handle} />
                    </Box>
                    <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => handleClickOpen(user.id)}
                    >
                    Add
                    </Button>
                </ListItem>
                ))
            :
                (searchKeywords ? filteredUsers : filteredUsers).map((user, index) => (
                <ListItem key={index} sx={{ justifyContent: 'space-between' }}>
                    <Box display="flex" alignItems="center">
                    <ListItemAvatar>
                        <Avatar>
                        <PersonIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={user.handle} />
                    </Box>
                    <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => handleClickOpen(user.id)}
                    >
                    Add
                    </Button>
                </ListItem>
                ))
            }
            </List>
        )}
      </Box>


      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Friend</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Select the bar where you met this user:
          </Typography>
          <Autocomplete
            options={barOptions}
            getOptionLabel={(option) => option.name}
            onChange={(event, newValue) => {
              setSelectedBar(newValue);
              setSelectedEvent(null); 
            }}
            renderInput={(params) => (
              <TextField {...params} label="Select Bar" variant="outlined" margin="normal" />
            )}
          />
          {selectedBar && (
            <>
              <Typography variant="body1">
                Select the event where you met this user (optional):
              </Typography>
              <Autocomplete
                options={eventOptions}
                getOptionLabel={(option) => option.name}
                onChange={(event, newValue) => setSelectedEvent(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Search Event" variant="outlined" margin="normal" />
                )}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmitFriendship}>Submit</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={loginPromptOpen} onClose={handleLoginPromptClose}>
        <DialogTitle>Please Log In</DialogTitle>
        <DialogContent>
          You need to be logged in to add a friend. Please log in or create an account.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLoginPromptClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSuccessDialog} onClose={handleCloseSuccessDialog}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Friendship created successfully!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
