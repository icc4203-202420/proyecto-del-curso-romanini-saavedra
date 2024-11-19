import React, {useState} from 'react';
import { Pagination, Box, Typography } from '@mui/material';
import Reviews from './Reviews';

const ReviewsList = ({reviewsData, currentUserId}) => {
    const reviewsPerPage = 3;
    const [currentPage, setCurrentPage] = useState(1);

    const sortedReviews = [...reviewsData].sort((a, b) => {
        if(a.user_id === currentUserId) return -1;
        if(b.user_id === currentUserId) return 1;
        return 0;
    });

    const totalReviews = sortedReviews.length;
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = sortedReviews.slice(indexOfFirstReview, indexOfLastReview);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    return (
        <Box>
            {totalReviews === 0 ? (
                <Typography>No reviews yet</Typography>
            ) : (
                <>
                    {currentReviews.map((review) => (
                        <Reviews key={review.id} reviewsData={review}/>
                    ))}
                    <Box display="flex" justifyContent="center" mt={2}>
                        <Pagination
                            count={Math.ceil(totalReviews / reviewsPerPage)}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            sx={{ mt: 2 }}
                        />
                    </Box>
                </>
            )}
        </Box>
    );
};

export default ReviewsList;