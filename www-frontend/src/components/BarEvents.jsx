import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BarEvents = () => {
  const { bar_id } = useParams();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:3001/api/v1/bars/${bar_id}/events`);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [bar_id]);

  return (
    <div>
      <h2>Events for Bar {bar_id}</h2>
      {/* Renderiza los eventos aquí */}
      {events.length > 0 ? (
        <ul>
          {events.map((event) => (
            <li key={event.id}>{event.name}</li>
          ))}
        </ul>
      ) : (
        <p>No events found for this bar.</p>
      )}
    </div>
  );
};

export default BarEvents;
