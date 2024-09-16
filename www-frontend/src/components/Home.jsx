import React, { useEffect, useState } from 'react';
import useAxios from 'axios-hooks';
import useLocalStorageState from 'use-local-storage-state';
import axios from 'axios';
import { Container, Grid, Autocomplete, TextField, List, ListItem, ListItemText, Button, Card, CardMedia, CardActions, CardContent, Typography, Box } from '@mui/material'
import beerMatesLogo from '../assets/images/beerMatesLogo.jpg'
import bottleIcon from '../assets/images/beer_bottle_icon.png'
import {Navigate, useNavigate} from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const handleFindMatesClick = () => {
        navigate('/users');
    };

    return (
        <div style={{backgroundColor: '#f5deb3', minHeight: '100vh'}}>
            <Container maxWidth="sm" sx={{display: 'flex', justifyContent: 'center', margin: '32px auto'}}>
                <img src={beerMatesLogo} alt="BeerMates Logo" style={{width: 200}}></img>
            </Container>

            <Button
                variant="contained"
                sx={{
                    backgroundColor: "#d4a373",
                    color: "#fff",
                    '&:hover': {
                        backgroundColor: '#D4A017',
                    },
                    marginBottom: '32px',
                    display: 'block',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                }}
                onClick={handleFindMatesClick}
            >
                Find Mates
            </Button>

            <Container maxWidth="sm">
                <Typography variant="h5" gutterBottom align="center">
                    Top Beers
                </Typography>

                <Grid container spacing={2}>
                    {[1, 2, 3, 4].map((beer, index) => (
                        <Grid item xs={12} key={index}>
                            <Card sx={{display: 'flex', marginBottom: '16px', backgroundColor: '#f5deb3'}}>
                                <CardMedia
                                    component="img"
                                    sx={{width: 80, padding: '16px'}}
                                    image={bottleIcon}
                                    alt="Beer Bottle"
                                />
                                <CardContent sx={{flex: 1}}>
                                    <Typography variant="h6">Lorem Ipsum Beer</Typography>
                                    <Typography variant="subtitle2">Beer Type, Lorem Ipsum Brand</Typography>
                                    <Typography variant="body2">★★★★★</Typography>
                                </CardContent>    
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </div>
    )
};

export default Home;