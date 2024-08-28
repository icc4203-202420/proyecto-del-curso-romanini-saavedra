import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, CardActions, CardContent, Typography, Box } from '@mui/material'

const Beers = () => {
    const [beers, setBeers] = useState([]);

    useEffect(() => {
        const fetchBeers = async () => {
            try {
                const apiURL = 'http://127.0.0.1:3001/api/v1/beers'
                const apiResponse = await axios.get(apiURL);
                
                console.log(apiResponse)
                setBeers(apiResponse.data.beers);

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
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {beer.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {"No description available"}
                                </Typography>
                            </CardContent>
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