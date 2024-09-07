import React, { useState } from 'react';
import { useParams} from 'react-router-dom';
import useAxios from 'axios-hooks';
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tabs, Tab, Grid, Button, Card, CardContent, Typography, Box } from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import beerBottleIcon from '../assets/images/beer_bottle_icon.png'
import StarIcon from '@mui/icons-material/Star';
import Reviews from './Reviews'
import CreateReview from './CreateReview'
import BarsBeers from './BarsBeers'

const Beer = () => {
    const [open, setOpen] = useState(false)
    const {beer_id} = useParams();
    const [tabIndex,  setTabIndex] = useState(0);

    const handleClickOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const [{ data: beerData, loading, error }, refetch] = useAxios({
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

    const [{ data: reviewsData }] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/beers/${beer_id}/reviews`,
        method: 'GET'
    })
    
    console.log("BEER DATA:", beerData)
    console.log("BRAND DATA:", brandData)
    console.log("BREWERY DATA:", breweryData)
    console.log("REVIEWS DATA:", reviewsData)
  
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
                <Card
                    sx={{
                        maxWidth: 300,
                        margin: 'auto',
                        backgroundColor: '#F5D7B0',
                        padding: 2,
                        borderRadius: 4
                    }}
                >
                    <IconButton sx={{marginBottom: 1}}>
                        <ArrowBackIosIcon/>
                    </IconButton>

                    <CardContent>
                        <Grid container alignItems="center">
                            <Grid item xs={8}>
                                <Typography variant="h4" sx={{fontWeight: 'bold'}}>
                                    {beerData.beer.name}
                                </Typography>
                                {brandData && breweryData && (
                                    <Typography variant="subtitle1" color="text.secondary">
                                        {`${breweryData.breweries[(brandData.brands[beerData.beer.brand_id].brewery_id)-1].name}`}
                                    </Typography>
                                )}
                                <Box display="flex" alignItems="center" my={1}>
                                    <StarIcon fontSize="small" color="secondary"/>
                                    <Typography variant="body2" sx={{marginLeft: 0.5}}>
                                        {beerData.beer.avg_rating !== undefined && beerData.beer.avg_rating !== null
                                            ? beerData.beer.avg_rating.toFixed(1)
                                            : "No reviews yet"}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <img
                                    src={beerBottleIcon}
                                    alt="beer"
                                    style={{width: '100%'}}
                                />
                            </Grid>
                        </Grid>
                        <Box display="flex" justifyContent="center" my={2}>
                            <Button
                                variant="outlined"
                                startIcon={<StarIcon/>}
                                sx={{borderRadius: 2}}
                                onClick={handleClickOpen}
                            >
                                Review
                            </Button>
                        </Box>
                        <Dialog open={open} onClose={handleClose}>
                            <DialogTitle>Review this beer</DialogTitle>
                            <DialogContent>
                                <CreateReview beer_id={beer_id} onClose={handleClose}/>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose}>Cancel</Button>
                            </DialogActions>
                        </Dialog>
                        <Tabs
                            value={tabIndex}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            sx={{marginBottom: 2}}
                        >
                            <Tab label="Information"></Tab>
                            <Tab label="Reviews"></Tab>
                            <Tab label="Available at"></Tab>
                        </Tabs>

                        {tabIndex === 0 && (
                            <Box>
                                <Typography variant="body2" gutterBottom>
                                    <strong>Style:</strong> {beerData.beer.style}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    <strong>Alcohol:</strong> {beerData.beer.alcohol}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    <strong>Hops:</strong> {beerData.beer.hop}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    <strong>IBU:</strong> {beerData.beer.ibu}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    <strong>Yeast:</strong> {beerData.beer.yeast}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    <strong>Malts:</strong> {beerData.beer.malts}
                                </Typography>
                            </Box>
                        )}
                        {tabIndex === 1 && (
                            <Box>
                                {reviewsData.map((review) => (
                                    <Reviews reviewsData={review}/>
                                ))
                                }
                            </Box>
                        )}
                        {tabIndex === 2 && (
                            <BarsBeers beer_id={beer_id}/>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
};

export default Beer;
