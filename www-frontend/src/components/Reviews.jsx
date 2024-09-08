import React, { useReducer, useEffect, }from 'react';
import useAxios from 'axios-hooks';
import { Card, CardContent, Typography, Box } from '@mui/material'
import StarIcon from '@mui/icons-material/Star';

const initialState = {
    user: null, 
    error: null,
    loading: true,
};

const reviewsReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload, loading: false };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'SET_LOADING':
            return { ...state, loading: true };
        default:
            return state;
    }
};

const Reviews = ({reviewsData}) => {
    const [state, dispatch] = useReducer(reviewsReducer, initialState);

    const [{ data: userData, loading, error}] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/users/${reviewsData.user_id}`,
        method: 'GET'
    })

    useEffect(() => {
        dispatch({ type: 'SET_LOADING' });

        if(error) {
            dispatch({ type: 'SET_ERROR', payload: error });
        } else if (userData) {
            dispatch({ type: 'SET_USER', payload: userData.user })
        }
    }, [userData, error]);

    return(
        <Box>
            {state.loading && <Typography>Loading...</Typography>}
            {state.error && <Typography color="error">Failed to load user data</Typography>}
            {state.user && (
                <Box>
                    <Card 
                        sx={{
                            width: 280,
                            height: 'auto',
                            maxHeight: 300,
                            overflow: 'auto',
                            marginBottom: 1,
                            backgroundColor: 'transparent',
                            borderRadius: 4
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" component="div" textAlign="left">
                                {userData.user.handle} 
                            </Typography>

                            <Box display='flex' alignItems='center' mb={1}>
                                <StarIcon fontSize='small' sx={{color: '#D4A017'}}/>
                                <Typography variant="body2" color="textSecondary" textAlign="left">
                                    {reviewsData.rating}
                                </Typography>
                                    
                            </Box>

                            <Typography variant="body1" mt={2} textAlign="left">
                                {reviewsData.text}
                            </Typography>
                        </CardContent>

                    </Card>
                </Box>

            )}
        </Box>
        
    )
};

export default Reviews;
