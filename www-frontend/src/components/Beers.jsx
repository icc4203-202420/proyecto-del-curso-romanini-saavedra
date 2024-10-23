import React, { useEffect, useState } from 'react';
import {Link} from 'react-router-dom';
import useAxios from 'axios-hooks';
import useLocalStorageState from 'use-local-storage-state';
import axios from 'axios';
import { Autocomplete, TextField, List, ListItem, ListItemText, Button, Card, CardMedia, CardActions, CardContent, Typography, Box } from '@mui/material'
import beerIcon from '../assets/images/beer_bottle_icon.png'

const Beers = () => {
    const [searchKeywords, setSearchKeywords] = useState('')
    const [keywordList, setKeywordList] = useLocalStorageState('BeerMates/SearchBeer/KeywordList', {
        defaultValue: []
    })

    const [{ data: allBeersData, loading, error}, refetch] = useAxios(
        {
            url: 'http://127.0.0.1:3001/api/v1/beers',
            method: 'GET'
        }
    );

    const handleInputChange = (event, newInputValue) => {
        setSearchKeywords(newInputValue);
    };

    const handleSearch = () => {
        if(searchKeywords && !keywordList.includes(searchKeywords)){
            setKeywordList([...keywordList, searchKeywords])
        }
    };
    
    const handleClearHistory = () => {
        setKeywordList([])
        setSearchKeywords("")
    }

    const filteredBeers = allBeersData?.beers?.filter(beer => 
        beer.name.toLowerCase().includes(searchKeywords.toLowerCase())
    );

    return (
        <Box display='flex' flexDirection="column" minHeight="100vh">
            <Box mb={2}>
                <Autocomplete
                    freeSolo
                    options={keywordList}
                    value={searchKeywords}
                    onInputChange={handleInputChange}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search Beer"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            sx={{
                                width: '200px',
                                height: '56px'
                            }}
                        />
                    )}
                />
            </Box>
            <Box flex="1">
                {loading && (
                    <Typography variant="body1" margin="normal">
                        Searching for beers...
                    </Typography>
                )}
                {error && (
                    <Typography variant="body1" color="error" margin="noraml">
                        Error fetching data.
                    </Typography>
                )}
                {allBeersData && (
                    <List>
                        {(searchKeywords ? filteredBeers : allBeersData.beers).map((beer, index) => (
                            <ListItem key={index} button component={Link} to={`/beers/${beer.id}`}>
                                <div style={{marginBottom: '20px', width: '100%'}}>
                                    <Card sx={{width: {xs: '260px', sm: '600px', md: '600px'}, maxWidth: '100%', height:'170px'}}>
                                        <Box sx={{height: "100%", display: 'flex', alignItems: 'center', backgroundColor: 'rgb(212, 160, 23)'}}>
                                            <CardMedia
                                                component="img"
                                                sx={{width: 100, height: 100, objectFit: 'cover'}}
                                                image={beerIcon}
                                                alt={beer.name}
                                            />
                                            <CardContent>
                                                <Typography variant="h6" component="div" sx={{textAlign: 'left', color: 'rgb(78, 42, 30)'}}>
                                                    {`${beer.name}`}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" sx={{textAlign: 'left', mt: 1, color: 'rgb(78, 42, 30)'}}>
                                                    {`Style: ${beer.style}`}
                                                </Typography>
                                            </CardContent>
                                        </Box>
                                    </Card>
                                </div>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Box>
    );
};

export default Beers;