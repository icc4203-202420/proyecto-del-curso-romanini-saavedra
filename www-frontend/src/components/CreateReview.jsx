import React, { useEffect, useState } from 'react';
import useAxios from 'axios-hooks';
import { Dialog, Slider, TextField, Button, Typography, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import {useUser} from '../context/UserContext';

const CreateReview = ({beer_id, onClose, onReviewCreated}) => {
    const { user } = useUser();
    const [review, setReview] = useState({
        text: '',
        rating: 0,
    });

    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [openReviewDialog, setOpenReviewDialog] = useState(true);
    const [validationError, setValidationError] = useState(null);
    
    const aux_token = localStorage.getItem('app-token');
    const token = aux_token.replace(/"/g, '');

    const [{ loading, error}, executePost] = useAxios(
        {
            url: `http://127.0.0.1:3001/api/v1/beers/${beer_id}/reviews`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        },
        {manual: true}
    );

    const countWords = (text) => {
        return text.trim().split(/\s+/).length;
    }

    const handleReviewChange = (event) => {
        const {name, value} = event.target;
        setReview({ ...review, [name]: value });
    }

    const handleRatingChange = (event, newValue) => {
        setReview({ ...review, rating: newValue });
    }

    const validateForm = () => {
        if(!review.text) {
            setValidationError('The review text is required.');
            return false;
        }
        if(countWords(review.text) < 15){
            setValidationError('The review text must have at least 15 words.');
            return false;
        }
        if(!review.rating || review.rating < 1 || review.rating > 5){
            setValidationError('Rating is required.');
            return false;
        }
        setValidationError(null);
        return true;
    }
    
    const handleSubmit = (event) => {
        event.preventDefault();
        if(!validateForm()){
            return;
        }

        executePost({
            data: {
                review: {
                    ...review, 
                    beer_id: beer_id,
                    user_id: user.id
                }
            }
        }).then((response) => {
            setOpenReviewDialog(false);
            setOpenSuccessDialog(true);
            if (onReviewCreated) onReviewCreated();
            console.log("Review created succesfully", response.data);
        }).catch((error) => {
            console.error("Error creating review:", error);
        });
    };

    const handleCloseSuccessDialog = () => {
        setOpenSuccessDialog(false);
        if(onClose) onClose();
    }

    return (
    <>
        <Dialog open={openReviewDialog} onClose={onClose}>
            <DialogTitle>Review this beer</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit} style={{width: 300, margin:'auto'}}>
                    <TextField
                        label="Add a comment"
                        variant="outlined"
                        name="text"
                        value={review.text}
                        onChange={handleReviewChange}
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                        error={!!validationError && validationError.includes('review text')}
                        helperText={validationError && validationError.includes('review text') ? validationError : ''}
                    />

                    <Typography gutterBottom>Rating: {review.rating.toFixed(1)}</Typography>
                    <Slider
                        value={review.rating}
                        min={1}
                        max={5}
                        step={0.1}
                        marks
                        onChange={handleRatingChange}
                        valueLabelDisplay="auto"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </Button>

                    {validationError && <Typography color="error">{validationError}</Typography>}
                    {error && <Typography color="error">Failed to submit review</Typography>}
                </form>
            </DialogContent>
        </Dialog>

        <Dialog open={openSuccessDialog} onClose={handleCloseSuccessDialog}>
            <DialogTitle>Success</DialogTitle>
            <DialogContent>
                <Typography variant="h6">Review created successfully!</Typography>
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

export default CreateReview;