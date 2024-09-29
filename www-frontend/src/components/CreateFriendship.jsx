import React, { useState } from 'react';
import useAxios from 'axios-hooks';
import { Dialog, Button, Typography, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useUser } from '../context/UserContext';

const CreateFriendship = ({ friend_id, onClose, onFriendshipCreated }) => {
  const { user } = useUser();
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openFriendshipDialog, setOpenFriendshipDialog] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const aux_token = localStorage.getItem('app-token');
  const token = aux_token.replace(/"/g, '');

  const [{ loading, error }, executePost] = useAxios(
    {
      url: `http://127.0.0.1:3001/api/v1/friendships`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    { manual: true }
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!user) {
      setErrorMessage('You must be logged in to add a friend.');
      return;
    }

    executePost({
      data: {
        friendship: {
          user_id: user.id,
          friend_id: friend_id,
          bar_id: 1 // Puedes modificar este valor según lo necesario
        },
      },
    })
      .then((response) => {
        setOpenFriendshipDialog(false);
        setOpenSuccessDialog(true);
        if (onFriendshipCreated) onFriendshipCreated();
        console.log('Friendship created successfully', response.data);
      })
      .catch((error) => {
        console.error('Error creating friendship:', error);
      });
  };

  const handleCloseSuccessDialog = () => {
    setOpenSuccessDialog(false);
    if (onClose) onClose();
  };

  return (
    <>
      <Dialog open={openFriendshipDialog} onClose={onClose}>
        <DialogTitle>Add Friend</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to add this user as a friend?
          </Typography>
          {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Add Friend'}
          </Button>
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
    </>
  );
};

export default CreateFriendship;
