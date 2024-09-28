import React, { useState, useRef } from 'react';
import axios from 'axios';

const ImageUploader = ({ eventId, userId, onImageUpload }) => {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [capturedPhoto, setCapturedPhoto] = useState(null);

    const [preview, setPreview] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
  
    const handleFileChange = (e) => {
        // const selectedFile = e.target.files[0];
        // if (selectedFile) {
        //     setFile(selectedFile);
        //     setPreview(URL.createObjectURL(selectedFile))
        // }
    //   setFile(e.target.files[0]);
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
                // setPreview(URL.createObjectURL(blob));
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

        setFile(null);
        setCapturedPhoto(null);
        setDescription('');
        // setPreview(null);

        if (onImageUpload) onImageUpload();

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
                <div>
                    <video ref={videoRef} autoPlay playsInline width="300" height="200"></video>
                    <button type="button" onClick={handleCapture}>Take Photo</button>
                    <canvas ref={canvasRef} width="300" height="200" style={{display: 'none'}}></canvas>
                </div>

                <input 
                    type="file" 
                    accept=".jpg, .jpeg, .png"
                    onChange={handleFileChange} 
                    required={!capturedPhoto}
                />
                <input
                    type="text"
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Description"
                />
                <button type="submit">Upload Image</button>
            </form>

            {capturedPhoto && (
                <div>
                    {console.log("CAPTURED PHOTO:", capturedPhoto)}
                    <p>Preview of Captured Photo:</p>
                    <img
                        src={URL.createObjectURL(capturedPhoto)}
                        alt="Captured"
                        style={{width: '300px', height:'200px'}}
                    />
                </div>
            )}

            {/* <div>
                <h3>Or take a photo:</h3>
                <video ref={videoRef} width="300" height="200" />
                <button onClick={startCamera}>Start Camera</button>
                <button onClick={handleTakePhoto}>Take Photo</button>
                <canvas ref={canvasRef} width="300" height="200" style={{ display: 'none' }} />
            </div>
            {preview && (
                <div>
                    <h3>Image Preview:</h3>
                    <img src={preview} alt="Preview" width="300" />
                </div>
            )} */}
        </div>
    );
  };

  export default ImageUploader;