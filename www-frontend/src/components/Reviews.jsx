import React, { useEffect, useState } from 'react';
import { useParams} from 'react-router-dom';
import useAxios from 'axios-hooks';
import useLocalStorageState from 'use-local-storage-state';
import axios from 'axios';
import { IconButton, Tabs, Tab, Grid, Autocomplete, TextField, List, ListItem, ListItemText, Button, Card, CardMedia, CardActions, CardContent, Typography, Box } from '@mui/material'
import beerIcon from '../assets/images/beer_bottle_icon.png'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import beerBottleIcon from '../assets/images/beer_bottle_icon.png'
import StarIcon from '@mui/icons-material/Star';

const Reviews = ({reviewsData}) => {
    const [{ data: userData}] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/users/${reviewsData.user_id}`,
        method: 'GET'
    })

    return(
        (userData && 
            <Box>
                <Typography>
                    {`User: ${userData.user.handle}`} {`Rating: ${reviewsData.rating}`}
                </Typography>
                <Typography>
                    {`Review: ${reviewsData.text}`}
                </Typography>
            </Box>
        )
    )
};

export default Reviews;
