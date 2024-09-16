import React from 'react';
import { useParams, Link } from 'react-router-dom';
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

  const [{ data: addressData, loading: addressLoading, error: addressError}] = useAxios({
    url: barData ? `http://127.0.0.1:3001/api/v1/addresses/${barData.bar.address_id}` : null,
    method: 'GET',
    manual: !barData 
  })

  const [{ data: countryData, loading: countryLoading, error: countryError}] = useAxios({
    url: addressData ? `http://127.0.0.1:3001/api/v1/countries/${addressData.address.country_id}` : null,
    method: 'GET',
    manual: !addressData   
  })

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      {/* Sección superior con el nombre del bar y la imagen de fondo */}
      {barData && addressData && countryData && (
        <Box position="relative" width={300} height={350} mb={2}>
            <CardMedia
                component="img"
                sx={{ 
                  height: '100%', 
                  width: '100%', 
                  objectFit: 'cover',
                  objectPosition: 'center',
                  opacity: 0.7
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
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'flex-start',
                paddingLeft: '2%',
                zIndex: 1,
                color: 'black',
                textAlign: 'left'
              }}
            >
            <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', color: 'black' }}>
              {barData.bar.name.toUpperCase()}
            </Typography>
            <Typography variant="h6" component="div" sx={{ color: 'black', fontWeight: 'bold'  }}>
              {addressData.address.line1}, {addressData.address.line2}  
            </Typography>
            <Typography variant="h7" component="div" sx={{ color: 'black', fontWeight: 'bold' }}>
              {addressData.address.city}, {countryData.country.name}  
            </Typography>
          </CardContent>
        </Box>
      )}

      {/* Lista de eventos */}
      <Box sx={{padding: 2, borderRadius: 2}}>
        <Typography variant="h5" component="div" sx={{ color: 'black', fontWeight: 'bold', mb: 2 }}>
          Events:
        </Typography>

      </Box>
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
                <React.Fragment key={event.id}>
                    <ListItem button component={Link} to={`/events/${event.id}`}>
                      <Card sx={{ width: '100%', backgroundColor: 'rgb(255, 244, 229)', borderRadius: 3 }}>
                          <CardContent>
                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                                {event.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{marginBottom: 2}}>
                                {formattedDate}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {event.description}
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
