import React from 'react';
import { useParams } from 'react-router-dom';
import useAxios from 'axios-hooks';
import { Box, Card, CardContent, CardMedia, Typography, List, ListItem, Divider } from '@mui/material';
import barImage from '../assets/images/FondoBar.jpg';

const BarEvents = () => {
  const { bar_id } = useParams();
  const [{ data: barData, loading, error }] = useAxios({
    url: `http://127.0.0.1:3001/api/v1/bars/${bar_id}`,
    method: 'GET'
  });

  const [{ data: eventsData }] = useAxios({
    url: `http://127.0.0.1:3001/api/v1/bars/${bar_id}/events`,
    method: 'GET'
  });

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      {/* Sección superior con el nombre del bar y la imagen de fondo */}
      {barData && (
        <Box position="relative" width="100%" height={300} mb={2}>
            <CardMedia
                component="img"
                sx={{ 
                height: '100%', 
                width: '100%', 
                objectFit: 'cover',
                objectPosition: 'center',
                opacity: 0.5
                }}
                image={barImage}
                title={barData.bar.name}
            />
            <CardContent 
            sx={{
              position: 'absolute', 
              top: 0, 
              left: 0, 
              height: '100%', 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              zIndex: 1
            }}
            >
            <Typography variant="h3" component="div" sx={{ color: 'black', fontWeight: 'bold' }}>
              {barData.bar.name}
            </Typography>
          </CardContent>
        </Box>
      )}

      {/* Lista de eventos */}
      <Typography variant="h4" component="div" sx={{ marginLeft: 2, marginBottom: 2, color: 'black' }}>
        Eventos:
      </Typography>
      <Box flex="1">
        {loading && (
            <Typography variant="body1" margin="normal">
                Loading events...
            </Typography>
        )}
        {error && (
            <Typography variant="body1" color="error" margin="normal">
                Error fetching events.
            </Typography>
        )}
        {eventsData && (
            <List>
                {eventsData.map((event, index) => {
                const eventDate = new Date(event.date);
                const formattedDate = eventDate.toLocaleDateString(undefined, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                });
                return(
                <React.Fragment key={index}>
                    <ListItem>
                    <Card sx={{ width: '100%', backgroundColor: 'rgb(255, 244, 229)', borderRadius: 3 }}>
                        <CardContent>
                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                            {`Name: ${event.name}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {`Description: ${event.description}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {`Date: ${formattedDate}`}
                        </Typography>
                        </CardContent>
                    </Card>
                    </ListItem>
                    {index < eventsData.length - 1 && <Divider sx={{ my: 2 }} />}
                </React.Fragment>
                );
                })}
            </List>
        )}
      </Box>
    </Box>
  );
};

export default BarEvents;
