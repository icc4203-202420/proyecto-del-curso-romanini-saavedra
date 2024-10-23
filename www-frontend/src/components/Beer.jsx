import React, { useState } from 'react';
import { useParams} from 'react-router-dom';
import useAxios from 'axios-hooks';
import { Dialog, DialogActions, DialogContent, DialogTitle, Tabs, Tab, Button, Card, CardContent, CardMedia, Typography, Box, Pagination } from '@mui/material'
import beerBottleIcon from '../assets/images/beer_bottle_icon.png'
import StarIcon from '@mui/icons-material/Star';
import ReviewsList from './ReviewsList'
import CreateReview from './CreateReview'
import BarsBeers from './BarsBeers'
import {useUser} from '../context/UserContext';

const Beer = () => {
    const {user, isAuthenticated} = useUser();
    const [open, setOpen] = useState(false);
    const [loginPromptOpen, setLoginPromptOpen] = useState(false);
    const {beer_id} = useParams();
    const [tabIndex,  setTabIndex] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 2;

    const handleClickOpen = () => {
        if (isAuthenticated) {
            setOpen(true);
        } else {
            setLoginPromptOpen(true);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleLoginPromptClose = () => {
        setLoginPromptOpen(false);
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleReviewCreated = () => {
        refetchBeerData();
        refetchReviews();
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const [{ data: beerData, loading, error }, refetchBeerData] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/beers/${beer_id}`,
        method: 'GET'
      });

    const [{ data: brandData}] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/brands`,
        method: 'GET'
    })

    const [{ data: breweryData}] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/breweries`,
        method: 'GET'
    })

    const [{ data: reviewsData }, refetchReviews] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/beers/${beer_id}/reviews`,
        method: 'GET'
    })

    const totalReviews = reviewsData && reviewsData.reviews ? reviewsData.reviews.length : 0;
    const totalPages = Math.ceil(totalReviews / reviewsPerPage);

    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    // const currentReviews = reviewsData?.slice(indexOfFirstReview, indexOfLastReview) || [];
    const currentReviews = reviewsData && reviewsData.reviews ? reviewsData.reviews.slice(indexOfFirstReview, indexOfLastReview) : [];
    // const totalPages = Math.ceil((reviewsData?.length || 0) / reviewsPerPage);
  
    return(
        <div>
            {loading && (
                <Typography variant="body1" margin="normal">
                    Loading beer data...
                </Typography>
            )}
            {error && (
                <Typography variant="body1" color="error" margin="normal">
                    Error fetching beer data.
                </Typography>
            )}

            {beerData && (
                <Box
                    sx={{
                        maxWidth: 280,
                        margin: 'auto',
                    }}
                >

                    <Box position="relative" width="100%" height={300} mb={2}>
                        <Card
                            sx={{
                                backgroundColor: 'transparent',
                                boxShadow: 'none',
                                border: 'none',
                                position: 'relative'
                            }}
                        >
                            <CardMedia
                                component="img"
                                sx={{ 
                                    height: '100%', 
                                    width: '100%', 
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                    opacity: 0.1
                                }}
                                image={beerBottleIcon}
                                title={beerData.beer.name}
                            />
                            <CardContent 
                                sx={{
                                    position: 'absolute', 
                                    top: 16, 
                                    left: 16, 
                                    zIndex: 1,
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    justifyContent: 'flex-start', 
                                    alignItems: 'flex-start'
                                }}
                            >
                                <Box display='flex' alignItems='center' mb={1}>
                                    <StarIcon fontSize='small' sx={{color: '#D4A017'}}/>
                                    {beerData.beer.avg_rating !== undefined && beerData.beer.avg_rating !== null
                                            ? (
                                                <Typography variant="body2" sx={{marginLeft: 0.5}}>
                                                    {beerData.beer.avg_rating.toFixed(1)}
                                                </Typography>
                                            ) : 
                                            (
                                                <Typography variant="body2" sx={{marginLeft: 0.5}}>
                                                    No reviews yet
                                                </Typography>
                                            )}
                                </Box>
                                <Typography variant="h4" component="div" sx={{ color: 'black', fontWeight: 'bold', textAlign: "left"}}>
                                    {beerData.beer.name}
                                </Typography>
                                {brandData && breweryData && (
                                    <Typography variant="subtitle1" color="black" sx={{ mt: 1, textAlign: "left"}}>
                                        {`Brewery: ${breweryData.breweries[(brandData.brands[beerData.beer.brand_id].brewery_id)-1].name}`}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                    <Box display="flex" justifyContent="left" my={2}>
                        <Button
                            variant="outlined"
                            startIcon={<StarIcon/>}
                            sx={{borderRadius: 2}}
                            onClick={handleClickOpen}
                            color="black"
                        >
                            Review
                        </Button>
                    </Box>
                    <Dialog open={open} onClose={handleClose}>
                        <DialogTitle>Review this beer</DialogTitle>
                        <DialogContent>
                            <CreateReview 
                                beer_id={beer_id} 
                                onClose={handleClose}
                                onReviewCreated={handleReviewCreated}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={loginPromptOpen} onClose={handleLoginPromptClose}>
                        <DialogTitle>Please Log In</DialogTitle>
                        <DialogContent>
                            You need to be logged in to review a beer. Please log in or create an account.
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleLoginPromptClose}>Close</Button>
                        </DialogActions>
                    </Dialog>
                    <Tabs
                        value={tabIndex}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            marginBottom: 2,
                            '.MuiTab-root': {
                                color: 'black',
                            },
                            '.Multi-selected': {
                                color: 'black',
                            }
                        }}
                        TabIndicatorProps={{
                            style: {
                                backgroundColor: '#D4A017'
                            }
                        }}
                    >
                        <Tab label="Information"></Tab>
                        <Tab label="Reviews"></Tab>
                        <Tab label="Available at"></Tab>
                    </Tabs>

                    {tabIndex === 0 && (
                        <Box>
                            <Typography variant="body1" gutterBottom textAlign="left" color="black">
                                <strong>Style:</strong> {beerData.beer.style}
                            </Typography>
                            <Typography variant="body1" gutterBottom textAlign="left" color="black">
                                <strong>Alcohol:</strong> {beerData.beer.alcohol}
                            </Typography>
                            <Typography variant="body1" gutterBottom textAlign="left" color="black">
                                <strong>Hops:</strong> {beerData.beer.hop}
                            </Typography>
                            <Typography variant="body1" gutterBottom textAlign="left" color="black"> 
                                <strong>IBU:</strong> {beerData.beer.ibu}
                            </Typography>
                            <Typography variant="body1" gutterBottom textAlign="left" color="black">
                                <strong>Yeast:</strong> {beerData.beer.yeast}
                            </Typography>
                            <Typography variant="body1" gutterBottom textAlign="left" color="black">
                                <strong>Malts:</strong> {beerData.beer.malts}
                            </Typography>
                        </Box>
                    )}
                    {tabIndex === 1 && (
                            <ReviewsList reviewsData={reviewsData} currentUserId={user?.id}/>
                    )}
                    {tabIndex === 2 && (
                        <BarsBeers beer_id={beer_id}/>
                    )}
                </Box>
            )}
        </div>
    )
};

export default Beer;
