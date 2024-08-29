import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, CardMedia, CardActions, CardContent, Typography, Box } from '@mui/material'
import barImage from '../assets/images/FondoBar.jpg'

const Bars = () => {
    const [bars, setBars] = useState([]);

    useEffect(() => {
        const fetchBars = async () => {
            try {
                const apiURL = 'http://127.0.0.1:3001/api/v1/bars'
                const apiResponse = await axios.get(apiURL);
                
                console.log(apiResponse)
                setBars(apiResponse.data.bars);

                console.log(apiResponse.data.bars)

            } catch(error){
                console.error('Failed to fetch API data:', error);
            }
        };

        fetchBars();
    }, []);

    return (
        <div>
            {bars.length > 0 ? (
                bars.map((bar) => (
                    <div style={{marginBottom: '20px'}}>
                        <Card sx={{height: 150, width: 400, position: 'relative', borderRadius: 3}}>
                            <CardMedia
                                sx={{ 
                                    height: 200, 
                                    width: '100%',
                                    position: 'absolute',
                                    top: 0, 
                                    left: 0,
                                    objectFit: 'cover',
                                    opacity: 0.5
                                }}
                                image={barImage}
                                title="Bars Background"
                            />
                            <CardContent sx={{position: 'relative', zIndex: 1}}>
                                <Typography gutterBottom variant="h5" component="div" sx={{fontWeight: 'bold', fontSize: 40}}>
                                    {bar.name}
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

export default Bars;