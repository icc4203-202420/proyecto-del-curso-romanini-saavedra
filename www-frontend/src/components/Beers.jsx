import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, CardMedia, CardActions, CardContent, Typography, Box } from '@mui/material'
import beerIcon from '../assets/images/beer_bottle_icon.png'

const Beers = () => {
    const [beers, setBeers] = useState([]);

    useEffect(() => {
        const fetchBeers = async () => {
            try {
                const apiURL = 'http://127.0.0.1:3001/api/v1/beers'
                const apiResponse = await axios.get(apiURL);
                
                console.log(apiResponse)
                setBeers(apiResponse.data.beers);

                console.log(apiResponse.data.beers)

            } catch(error){
                console.error('Failed to fetch API data:', error);
            }
        };

        fetchBeers();
    }, []);

    return (
        <div>
            {beers.length > 0 ? (
                beers.map((beer) => (
                    <div style={{marginBottom: '20px'}}>
                        <Card>
                            <Box sx={{height: 150, display: 'flex', alignItems: 'center', backgroundColor: 'rgb(245, 222, 179)'}}>
                                <CardMedia
                                    component="img"
                                    sx={{width: 100, height: 100, objectFit: 'cover'}}
                                    image={beerIcon}
                                    alt={beer.name}
                                />
                                <CardContent>
                                    <Typography variant="h6" component="div" sx={{textAlign: 'left', color: 'rgb(78, 42, 30)'}}>
                                        {beer.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{textAlign: 'left', mt: 1, color: 'rgb(78, 42, 30)'}}>
                                        {beer.style}
                                    </Typography>
                                </CardContent>
                            </Box>
                        </Card>
                    </div>
                ))
            ) : (
                <Typography variant="body1">
                    <p>Cargando datos de la cerveza...</p>
                </Typography>
            )}
        </div>
    );
};

export default Beers;