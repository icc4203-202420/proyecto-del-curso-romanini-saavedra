import React, { useEffect, useState } from 'react';
import useAxios from 'axios-hooks';
import useLocalStorageState from 'use-local-storage-state';
import axios from 'axios';
import { Autocomplete, TextField, List, ListItem, ListItemText, Button, Card, CardMedia, CardActions, CardContent, Typography, Box } from '@mui/material'
import beerIcon from '../assets/images/beer_bottle_icon.png'

const Users = () => {
    const [searchKeywords, setSearchKeywords] = useState('')
    const [keywordList, setKeywordList] = useLocalStorageState('BeerMates/SearchBeer/KeywordList', {
        defaultValue: []
    })

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

    return (
        <Box mb={2}>
            <Autocomplete
                freeSolo
                options={keywordList}
                value={searchKeywords}
                onInputChange={handleInputChange}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Search Users"
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
    );
};

export default Users;