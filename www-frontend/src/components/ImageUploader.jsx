import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Button, TextField, Box, Typography } from '@mui/material';

const ImageUploader = ({ eventId, userId, onImageUpload }) => {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [capturedPhoto, setCapturedPhoto] = useState(null);

    const [preview, setPreview] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
  
    const handleFileChange = (e) => {
        setCapturedPhoto(null);
        setFile(e.target.files[0]);
    };
  
    const handleDescriptionChange = (e) => {
      setDescription(e.target.value);
    };

    const handleCapture = async () => {
        try {
            await startCamera();
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                const fileFromCamera = new File([blob], "captured_image.jpg", {type: 'image/png'});
                setFile(null);
                setCapturedPhoto(fileFromCamera);
            }, 'image/png');
        } catch (error) {
            console.error("Error starting camera:", error);
        }

    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!file && !capturedPhoto){
        alert("Please select an image or take a photo.");
        return;
      }

      const formData = new FormData();
      formData.append('event_picture[image]', file || capturedPhoto);
      formData.append('event_picture[event_id]', eventId);
      formData.append('event_picture[user_id]', userId);
      formData.append('event_picture[description]', description);
  
      try {
        const response = await axios.post('http://127.0.0.1:3000/api/v1/event_pictures', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log("API RESPONSE:", response.data);
        const newImage = {
            id: response.data.id, 
            image_url: response.data.image_url, 
            description: description,
            user_id: userId
        };

        setFile(null);
        setCapturedPhoto(null);
        setDescription('');

        if (onImageUpload) onImageUpload(newImage);

      } catch (error) {
        if (error.response) {
            console.error('Response error:', error.response.data);
        } else {
            console.error('Error uploading image', error);
        }
      }
    };

    const startCamera = () => {
        navigator.mediaDevices.getUserMedia({ video: true})
            .then(stream => {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            })
            .catch(err => {
                console.error('Error accessing camera', err);
            })
    };
  
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <Box sx={{display:'flex', flexDirection: 'column', aligntItems: 'center', margin: 2}}>
                    <Box sx={{display:'flex', flexDirection: 'column', aligntItems: 'center', marginBottom: 2}}>
                        <video ref={videoRef} autoPlay playsInline width="250" height="200" style={{ borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}></video>
                        <Button variant="contained" color="primary" onClick={handleCapture} sx={{ marginTop: 1 }}>
                            Take Photo
                        </Button>
                        <canvas ref={canvasRef} width="250" height="200" style={{ display: 'none' }}></canvas>
                    </Box>

                    <TextField
                        type="file"
                        accept=".jpg, .jpeg, .png"
                        onChange={handleFileChange}
                        required={!capturedPhoto}
                        sx={{ marginBottom: 2 }} 
                    />

                    <TextField
                        type="text"
                        value={description}
                        onChange={handleDescriptionChange}
                        placeholder="Description"
                        variant="outlined"
                        fullWidth
                        sx={{ marginBottom: 2 }} 
                    />

                    <Button type="submit" variant="contained" color="success">
                        Upload Image
                    </Button>

                </Box>
            </form>

            {capturedPhoto && (
                <Box sx={{marginTop: 2, textAling: 'center'}}>
                    <Typography variant="body1">Preview of Captured Photo:</Typography>
                    <img
                        src={URL.createObjectURL(capturedPhoto)}
                        alt="Captured"
                        style={{width: '250px', height: '200px', borderRadius: '8px', marginTop: '10px'}}
                    />

                </Box>
            )}
        </div>
    );
  };

  export default ImageUploader;