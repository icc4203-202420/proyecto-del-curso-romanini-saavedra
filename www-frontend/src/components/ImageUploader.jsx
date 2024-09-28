import React, { useState } from 'react';
import axios from 'axios';

const ImageUploader = ({ eventId, userId, onImageUpload }) => {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
  
    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
    };
  
    const handleDescriptionChange = (e) => {
      setDescription(e.target.value);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('event_picture[image]', file);
      formData.append('event_picture[event_id]', eventId);
      formData.append('event_picture[user_id]', userId);
      formData.append('event_picture[description]', description);
  
      try {
        const response = await axios.post('http://127.0.0.1:3001/api/v1/event_pictures', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const newImage = {
            id: response.data.id, 
            image_url: response.data.image_url, 
            description: description,
        };

        onImageUpload(newImage);
        setFile(null);
        setDescription('');

      } catch (error) {
        if (error.response) {
            console.error('Response error:', error.response.data);
        } else {
            console.error('Error uploading image', error);
        }
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} required />
        <input
          type="text"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Description"
        />
        <button type="submit">Upload Image</button>
      </form>
    );
  };

  export default ImageUploader;