import React, {useState, useRef} from 'react';

export default function Home() {
    const [isRecording, setIsRecording] = useState(false);
    const [text, setText] = useState("");
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const [isLoading, setIsLoading] = useState(false); // Add this line


    const startRecording = () => {
        setText("");

        navigator.mediaDevices.getUserMedia({audio: true})
            .then(stream => {
                mediaRecorder.current = new MediaRecorder(stream);
                mediaRecorder.current.start();

                mediaRecorder.current.ondataavailable = (event) => {
                    audioChunks.current.push(event.data);
                };

                setIsRecording(true);
            })
            .catch(err => console.error('Error accessing media devices.', err));
    };

    const stopRecording = () => {
        setIsLoading(true); // Start loading
        mediaRecorder.current.stop();
        setIsRecording(false);

        mediaRecorder.current.onstop = () => {
            const audioBlob = new Blob(audioChunks.current, {type: 'audio/mpeg'});
            audioChunks.current = [];

            const audioUrl = URL.createObjectURL(audioBlob);

            // Prepare the file to be sent
            const formData = new FormData();
            formData.append('file', audioBlob, 'tmp.mp3');

            // Send the file to the server
            fetch('/api/openai/tts', {
                method: 'POST',
                body: formData,
            })
                .then(response => response.json())
                .then(data => {
                    setText(data.transcript);
                })
                .catch(error => console.error('Error:', error))
                .finally(() => setIsLoading(false));
        };
    };

    return (
        <main className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6 relative">
            {(!isLoading &&
            <div className="bg-white shadow-lg rounded-lg p-8 mb-6 relative z-10">
                <div className="flex flex-col items-center justify-center gap-4">
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`px-6 py-3 rounded-full font-bold transition-colors 
                            ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} 
                            text-white`}
                    >
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </button>

                    {isRecording && (
                        <div className="loading flex justify-center items-center gap-2">
                            <span className="h-4 w-1 bg-blue-500 animate-pulse"></span>
                            <span className="h-4 w-1 bg-green-500 animate-pulse delay-100"></span>
                            <span className="h-4 w-1 bg-yellow-500 animate-pulse delay-200"></span>
                            <span className="h-4 w-1 bg-red-500 animate-pulse delay-300"></span>
                            <span className="h-4 w-1 bg-purple-500 animate-pulse delay-400"></span>
                        </div>
                    )}
                </div>

                <div className="text-display-container mt-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Converted Text:</h2>
                    <div className="text-area border border-gray-300 rounded p-4 max-w-xl w-full bg-gray-50">
                        {text || ""}
                    </div>
                </div>
            </div>)}

            {isLoading && (
                <div>
                    <p className="items-center text-4xl text-yellow-400 py-1 px-3">Loading...</p>

                <div aria-label="Orange and tan hamster running in a metal wheel" role="img"
                     className="wheel-and-hamster">
                    <div className="wheel"></div>
                    <div className="hamster">
                        <div className="hamster__body">
                            <div className="hamster__head">
                                <div className="hamster__ear"></div>
                                <div className="hamster__eye"></div>
                                <div className="hamster__nose"></div>
                            </div>
                            <div className="hamster__limb hamster__limb--fr"></div>
                            <div className="hamster__limb hamster__limb--fl"></div>
                            <div className="hamster__limb hamster__limb--br"></div>
                            <div className="hamster__limb hamster__limb--bl"></div>
                            <div className="hamster__tail"></div>
                        </div>
                    </div>
                    <div className="spoke"></div>
                </div>
                </div>
            )}
        </main>
    );
}