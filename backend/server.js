const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs'); // For file system operations
const path = require('path'); // For path operations
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configure multer storage for storing images in a public directory
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'public', 'uploads'); // Directory to store images
        fs.mkdirSync(dir, { recursive: true }); // Create directory if it doesn't exist
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

const upload = multer({ storage });

async function sendToChatGPT(messages) {
    const apiKey = process.env.OPENAI_API_KEY; // Ensure your key is securely stored in environment variables
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    try {
        const response = await axios.post(apiUrl, {
            model: "gpt-4o-mini", // Specify the model
            messages, // Send the messages array directly
        }, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            }
        });

        return response.data.choices[0].message.content; // Return the complete message content
    } catch (error) {
        console.error("Error in ChatGPT request:", error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch response from ChatGPT.');
    }
}

app.post('/api/process', upload.array('images'), async (req, res) => {
    let gptResponse; // Initialize gptResponse variable

    try {
        const { text } = req.body; // Extract text from the request body
        const images = req.files || []; // Extract images from the request

        // Prepare the messages for ChatGPT
        const messages = [
            {
                role: "user",
                content: [
                    { type: "text", text: text || "No text provided." }
                ]
            }
        ];

        // Process images if any and construct the messages
        if (images.length > 0) {
            const imageUrls = images.map(file => ({
                type: "image_url",
                image_url: {
                    url: `https://gpt-web-app.onrender.com/uploads/${file.filename}` // Public URL for the image
                }
            }));

            messages[0].content.push(...imageUrls); // Add images to the messages
        }

        // Send the message to ChatGPT
        gptResponse = await sendToChatGPT(messages); // Call GPT with the prepared message

        // Send back the response including gptResponse
        res.status(200).json({ message: 'Processing completed.', gptResponse });
    } catch (error) {
        console.error("Processing Error:", error.message);
        res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
});

// Serve static files from the public directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
