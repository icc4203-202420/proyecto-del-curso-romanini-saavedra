import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAxios from 'axios-hooks';
import useLocalStorageState from 'use-local-storage-state';
import { Autocomplete, TextField, List, ListItem, Card, CardMedia, CardContent, Typography, Box } from '@mui/material';
import barImage from '../assets/images/FondoBar.jpg';

const Bars = () => {
    const [searchKeywords, setSearchKeywords] = useState('');
    const [keywordList, setKeywordList] = useLocalStorageState('BeerMates/SearchBar/KeywordList', { defaultValue: [] });

    const [{ data: allBarsData, loading, error }] = useAxios({
        url: 'http://127.0.0.1:3001/api/v1/bars',
        method: 'GET'
    });

    const [{ data: addressData }] = useAxios({
        url: 'http://127.0.0.1:3001/api/v1/addresses',
        method: 'GET'
    });

    const [{ data: countryData }] = useAxios({
        url: 'http://127.0.0.1:3001/api/v1/countries',
        method: 'GET'
    });

    const handleInputChange = (event, newInputValue) => {
        setSearchKeywords(newInputValue);
    };

    const filteredBars = allBarsData?.bars?.filter(bar =>
        bar.name.toLowerCase().includes(searchKeywords.toLowerCase())
    );

    const findAddress = (id) => {
        return addressData?.addresses?.find(address => address.id === id) || null;
    };

    const findCountryName = (countryId) => {
        const country = countryData?.countries?.find(country => country.id === countryId);
        return country ? country.name : 'Unknown Country';
    };

    return (
        <Box display="flex" flexDirection="column" minHeight="100vh" p={2}>
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
                    <Typography variant="body1" color="error" margin="normal">
                        Error fetching data.
                    </Typography>
                )}
                {allBarsData && (
                    <List>
                        {(searchKeywords ? filteredBars : allBarsData.bars).map((bar, index) => {
                            const address = findAddress(bar.address_id);
                            return (
                                <ListItem key={index} button component={Link} to={`/bars/${bar.id}/events`}>
                                    <div style={{ marginBottom: '20px', width: '100%' }}>
                                        <Card sx={{ height: 200, width: { xs: '100%', sm: '600px', md: '600px' }, maxWidth: '100%', position: 'relative', borderRadius: 3, backgroundColor: 'rgb(196, 98, 0)' }}>
                                            <CardMedia
                                                sx={{
                                                    height: '100%',
                                                    width: '100%',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    objectFit: 'cover',
                                                    opacity: 0.4
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
                                                    textAlign: 'center',
                                                    padding: 2
                                                }}
                                            >
                                                <Typography
                                                    gutterBottom
                                                    variant="h5"
                                                    component="div"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        fontSize: 24,
                                                        color: 'rgb(78, 42, 30)',
                                                        mb: 1
                                                    }}
                                                >
                                                    {bar.name}
                                                </Typography>
                                                {address && (
                                                    <Box sx={{ textAlign: 'center' }}>
                                                        <Typography
                                                            variant="body1"
                                                            component="div"
                                                            sx={{
                                                                fontSize: 16,
                                                                color: 'rgb(78, 42, 30)',
                                                                mb: 1
                                                            }}
                                                        >
                                                            <strong>{address.line1}, {address.line2}</strong>
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            component="div"
                                                            sx={{
                                                                fontSize: 14,
                                                                color: 'rgb(78, 42, 30)',
                                                                mb: 1
                                                            }}
                                                        >
                                                            <strong>{address.city}, {findCountryName(address.country_id)}</strong>
                                                        </Typography>
                                                       
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </ListItem>
                            );
                        })}
                    </List>
                )}
            </Box>
        </Box>
    );
};

export default Bars;
