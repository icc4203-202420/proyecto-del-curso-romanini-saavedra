import React, { useState } from 'react';
import useAxios from 'axios-hooks';
import useLocalStorageState from 'use-local-storage-state';
import { Autocomplete, TextField, List, ListItem, ListItemAvatar, Avatar, ListItemText, Button, Box, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Person as PersonIcon, Add as AddIcon } from '@mui/icons-material';
import { useUser } from '../context/UserContext'; // Para manejar el usuario logueado
import CreateFriendship from './CreateFriendship'; // Importa el componente CreateFriendship

const Users = () => {
    const { user, isAuthenticated } = useUser(); // Obtener información del usuario y estado de autenticación
    const [searchKeywords, setSearchKeywords] = useState('');
    const [keywordList, setKeywordList] = useLocalStorageState('BeerMates/SearchBeer/KeywordList', {
        defaultValue: []
    });

    const [{ data: allUsersData, loading, error }] = useAxios({
        url: 'http://127.0.0.1:3001/api/v1/users',
        method: 'GET'
    });

    const [open, setOpen] = useState(false); // Estado para el diálogo de añadir amigo
    const [loginPromptOpen, setLoginPromptOpen] = useState(false); // Estado para el diálogo de login
    const [selectedUserId, setSelectedUserId] = useState(null); // Usuario seleccionado para añadir como amigo

    const handleInputChange = (event, newInputValue) => {
        setSearchKeywords(newInputValue);
    };

    const filteredUsers = allUsersData?.users?.filter(user =>
        user.handle.toLowerCase().includes(searchKeywords.toLowerCase())
    );

    const handleClickOpen = (userId) => {
        setSelectedUserId(userId); // Guardar el ID del usuario a añadir
        if (isAuthenticated) {
            setOpen(true);
        } else {
            setLoginPromptOpen(true); // Mostrar el prompt de login si no está autenticado
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleLoginPromptClose = () => {
        setLoginPromptOpen(false);
    };

    const handleFriendshipCreated = () => {
        // Lógica para cuando la amistad se haya creado (puedes agregar aquí algún refetch o actualización de datos)
        console.log('Friendship created');
        handleClose(); // Cerrar el diálogo
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
                        {(searchKeywords ? filteredUsers : allUsersData.users).map((user, index) => (
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
                        ))}
                    </List>
                )}
            </Box>

            {/* Diálogo para crear amistad */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add Friend</DialogTitle>
                <DialogContent>
                    <CreateFriendship
                        user_id={user.id} // ID del usuario logueado
                        friend_id={selectedUserId} // ID del amigo seleccionado
                        onClose={handleClose}
                        onFriendshipCreated={handleFriendshipCreated} // Llamar cuando se cree la amistad
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de inicio de sesión */}
            <Dialog open={loginPromptOpen} onClose={handleLoginPromptClose}>
                <DialogTitle>Please Log In</DialogTitle>
                <DialogContent>
                    <Typography>You need to be logged in to add a friend. Please log in or create an account.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleLoginPromptClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Users;
