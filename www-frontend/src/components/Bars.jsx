import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAxios from 'axios-hooks';
import useLocalStorageState from 'use-local-storage-state';
import axios from 'axios';
import { Autocomplete, TextField, List, ListItem, ListItemText, Button, Card, CardMedia, CardActions, CardContent, Typography, Box } from '@mui/material'
import barImage from '../assets/images/FondoBar.jpg'

const Bars = () => {
    const [searchKeywords, setSearchKeywords] = useState('')
    const [keywordList, setKeywordList] = useLocalStorageState('BeerMates/SearchBar/KeywordList', {
        defaultValue: []
    })

    const [{ data: allBarsData, loading, error}, refetch] = useAxios(
        {
            url: 'http://127.0.0.1:3001/api/v1/bars',
            method: 'GET'
        }
    );

    const handleInputChange = (event, newInputValue) => {
        setSearchKeywords(newInputValue);
    };

    const filteredBars = allBarsData?.bars?.filter(bar => 
        bar.name.toLowerCase().includes(searchKeywords.toLowerCase())
    );

    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <Box mb={2}>
                <Autocomplete
                    freeSolo
                    options={keywordList}
                    value={searchKeywords}
                    onInputChange={handleInputChange}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search Bars"
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
                        Searching for bars...
                    </Typography>
                )}
                {error && (
                    <Typography variant="body1" color="error" margin="noraml">
                        Error fetching data.
                    </Typography>
                )}
                {allBarsData && (
                    <List>
                        {(searchKeywords ? filteredBars : allBarsData.bars).map((bar, index) => (
                            <ListItem key={index} button component={Link} to={`/bars/${bar.id}/events`}>
                                <div style={{marginBottom: '20px'}}>
                                    <Card sx={{height: 150, width: {xs: '280px', sm: '600px', md: '600px'}, maxWidth: '100%', position: 'relative', borderRadius: 3, backgroundColor: 'rgb(196, 98, 0)'}}>
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
                                        <CardContent 
                                            sx={{
                                                position: 'relative', 
                                                zIndex: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: '100%',
                                                textAlign: 'center'
                                                }}
                                        >
                                        <Typography 
                                            gutterBottom 
                                            variant="h5" 
                                            component="div" 
                                            sx={{
                                                fontWeight: 'bold', 
                                                fontSize: 40, 
                                                color: 'rgb(78, 42, 30)'
                                            }}
                                        >
                                            {bar.name}
                                        </Typography>
                                        </CardContent>
                                    </Card>
                                </div>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Box>
    )
};

export default Bars;