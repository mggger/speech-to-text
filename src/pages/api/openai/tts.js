
import FormData from 'form-data';
import formidable from 'formidable';
import fs from 'fs';
import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const form = formidable({});

        const { fields, files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.error('Form parse error:', err);
                    return reject('Error parsing the form data');
                }
                resolve({ fields, files });
            });
        });

        const audioFile = files?.file?.path;
        if (!audioFile) {
            return res.status(400).json({ error: 'No audio file found' });
        }

        const formData = new FormData();
        formData.append('file', fs.createReadStream(audioFile));
        formData.append('model', 'whisper-1'); // Adjust according to API requirements

        const openaiApiKey = process.env.NEXT_PUBLIC_API_KEY;

        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${openaiApiKey}`,
            },
        });

        res.status(200).json({ transcript: response.data });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error processing audio file' });
    }
}

