import React, { useEffect, useState } from 'react';
import useAxios from 'axios-hooks';
import {Typography, Card, CardContent, Box} from '@mui/material'

const EventUsers = ({event_id}) => {
    const [{ data: attendanceData, loading: attendancesLoading, error: attendancesError }] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/attendances`,
        method: 'GET'
    })

    const [usersFiltered, setUsersFiltered] = useState([])

    useEffect(() => {
        if (attendanceData) {
            const filtered = attendanceData.attendances.filter(
                (element) => parseInt(element.event_id) === parseInt(event_id)
            );
            setUsersFiltered(filtered);
        }
    }, [attendanceData, event_id]);

    if (attendancesLoading) {
        return <Typography>Loading...</Typography>
    }
    if (attendancesError) {
        return <Typography>Error fetching attendance data</Typography>
    }

    return (
        <div>
            {usersFiltered.length > 0 ? (
                usersFiltered.map((user) => <SingleUser key={user.id} userId={user.user_id}/>)
            ) : (
                <Typography color="black">Be the first to check in to this event!</Typography>
            )}
        </div>
    );
};

const SingleUser = ({userId}) => {
    const [{data: userData, loading, error}] = useAxios({
        url: `http://127.0.0.1:3001/api/v1/users/${userId}`,
        method: 'GET'
    });

    if (loading) return null;
    if (error) return <Typography>Error fetching data for user {userId}</Typography>;

    return (
        <div>
            {userData && (
                <Card
                    sx={{
                        width: 280,
                        height: 'auto',
                        maxHeight: 300,
                        overflow: 'auto',
                        marginBottom: 2,
                        backgroundColor: 'transparent',
                        borderRadius: 4
                    }}
                >
                    <CardContent>
                        <Typography variant="h5" component="div" textAlign="center">
                            {userData.user.handle}
                        </Typography>

                    </CardContent>

                </Card>
            )}
        </div>
    )
}

export default EventUsers;
