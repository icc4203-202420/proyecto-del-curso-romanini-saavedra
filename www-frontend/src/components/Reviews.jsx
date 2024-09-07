import React, { useReducer, useEffect, }from 'react';
import useAxios from 'axios-hooks';
import { Typography, Box } from '@mui/material'

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
                    <Typography>
                        {`User: ${userData.user.handle}`} {`Rating: ${reviewsData.rating}`}
                    </Typography>
                    <Typography>
                        {`Review: ${reviewsData.text}`}
                    </Typography>
                </Box>
            )}
        </Box>
        
    )
};

export default Reviews;
