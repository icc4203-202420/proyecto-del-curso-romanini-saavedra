import React, { useEffect, useState } from 'react';
import useAxios from 'axios-hooks';
import {Typography} from '@mui/material'

const BarsBeers = ({beer_id}) => {
    const [{ data: barsBeersData, loading: barsLoading, error: barsError }] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/bars_beers`,
        method: 'GET'
    })

    const [barsFiltered, setBarsFiltered] = useState([])

    useEffect(() => {
        if (barsBeersData) {
            const filtered = barsBeersData.bars_beers.filter(
                (element) => parseInt(element.beer_id) === parseInt(beer_id)
            );
            setBarsFiltered(filtered);
        }
    }, [barsBeersData, beer_id]);

    if (barsLoading) {
        return <Typography>Loading...</Typography>
    }
    if (barsError) {
        return <Typography>Error fetching bars data</Typography>
    }

    return (
        <div>
            {barsFiltered.length > 0 ? (
                barsFiltered.map((bar) => <SingleBar key={bar.id} barId={bar.bar_id}/>)
            ) : (
                <Typography>No bars serve this beer.</Typography>
            )}
        </div>
    );
};

const SingleBar = ({barId}) => {
    const [{data: barData, loading, error}] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/bars/${barId}`,
        method: 'GET'
    });

    if (loading) return null;
    if (error) return <Typography>Error fetching data for bar {barId}</Typography>;

    return (
        <div>
            {barData && (
                <Typography>
                    {barData.bar.name}
                </Typography>
            )}
        </div>
    )
}

export default BarsBeers;
