import React, { useState } from 'react';
import axios from 'axios';
import './UploadForm.css'; // Import the CSS file for styles

function UploadForm() {
    const [text, setText] = useState('');
    const [images, setImages] = useState([]);
    const [response, setResponse] = useState(null);

    const handleTextChange = (e) => setText(e.target.value);

    const handleImageChange = (e) => setImages([...e.target.files]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('text', text); // Append text to FormData

        // Append each selected image to FormData
        images.forEach((image) => {
            formData.append('images', image);
        });

        try {
            const res = await axios.post('http://localhost:5000/api/process', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResponse(res.data); // Set the response from the server
        } catch (error) {
            console.error('Error uploading data:', error);
            setResponse({ error: 'Failed to upload data' }); // Optionally set error response
        }
    };

    return (
        <div className="upload-form-container">
            <h1>ChatGPT Image and Text Upload</h1>
            <form className="upload-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="text">Enter Text:</label>
                    <textarea 
                        id="text" 
                        value={text} 
                        onChange={handleTextChange} 
                        placeholder="Type your message here..." 
                        rows="4"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="images">Upload Images:</label>
                    <input 
                        type="file" 
                        id="images" 
                        onChange={handleImageChange} 
                        multiple 
                        accept="image/*"
                    />
                </div>
                <button type="submit" className="submit-button">Submit</button>
            </form>

            {response && response.gptResponse && (
                <div className="response-container">
                    <h2>Response from GPT</h2>
                    <p>{response.gptResponse}</p> {/* Display only the gptResponse field */}
                </div>
            )}
        </div>
    );
}

export default UploadForm;
