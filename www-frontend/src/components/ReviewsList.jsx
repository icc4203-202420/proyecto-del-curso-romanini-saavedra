import React from 'react';
import { Box, Typography } from '@mui/material';
import Reviews from './Reviews';

const ReviewsList = ({reviewsData, currentUserId}) => {
    const sortedReviews = [...reviewsData].sort((a, b) => {
        if(a.user_id === currentUserId) return -1;
        if(b.user_id === currentUserId) return 1;
        return 0;
    });

    return (
        <Box>
            {parseInt(sortedReviews.length) === 0 ? (
                <Typography>No reviews yet</Typography>
            ) : (
                sortedReviews.map((review) => (
                    <Reviews key={review.id} reviewsData={review}/>
                ))
            )}
        </Box>
    );
};

export default ReviewsList;