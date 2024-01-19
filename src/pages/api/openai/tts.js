import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import formidable from 'formidable-serverless';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Form parse error:', err);
            return res.status(500).json({ error: 'Error parsing the form data' });
        }

        const audioFile = files?.file?.filepath;
        if (!audioFile) {
            return res.status(400).json({ error: 'No audio file found' });
        }

        const formData = new FormData();
        formData.append('file', fs.createReadStream(audioFile));
        formData.append('model', 'whisper-1'); // Adjust according to API requirements

        const openaiApiKey = process.env.OPENAI_API_KEY;

        axios.post('https://api.openai.com/v1/your-api-endpoint', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${openaiApiKey}`,
            },
        })
            .then(response => {
                res.status(200).json({ transcript: response.data });
            })
            .catch(error => {
                console.error('Error calling OpenAI API:', error);
                res.status(500).json({ error: 'Error processing audio file' });
            });
    });
}
