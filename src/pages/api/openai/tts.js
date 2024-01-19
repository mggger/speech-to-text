import FormData from 'form-data';
import formidable from 'formidable';
import fs from 'fs';
import axios from 'axios';
import {HttpsProxyAgent} from 'https-proxy-agent';


export const config = {
    api: {
        bodyParser: false, // Disallow body parsing, consume as stream
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({message: 'Method not allowed'});
    }

    try {
        const form = formidable();

        const {fields, files} = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.error('Form parse error:', err);
                    reject(err);
                }
                resolve({fields, files});
            });
        });

        const audioFile = files.file && files.file.length > 0 ? files.file[0].filepath : null;
        const newFilePath = audioFile + '.mpeg';
        if (audioFile) {
            // 设置新的文件路径，包括 .mpeg 扩展名

            // 重命名文件以包含正确的扩展名
            fs.rename(audioFile, newFilePath, (err) => {
                if (err) {
                    console.error('Error renaming file:', err);
                } else {
                    console.log('File renamed successfully to:', newFilePath);
                    // 在这里继续处理新文件路径（例如，上传到 OpenAI API）
                }
            });
        } else {
            console.log('No audio file found');
        }

        const formData = new FormData();
        formData.append('file', fs.createReadStream(newFilePath));
        formData.append('model', 'whisper-1');

        const openaiApiKey = process.env.NEXT_PUBLIC_API_KEY; // 更改为非公开环境变量

        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${openaiApiKey}`,
            }
        });

        res.status(200).json({transcript: response.data.text});
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.status(500).json({error: 'Error processing audio file'});
    }
}