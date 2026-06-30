
const imageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const testAIImage = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/ai/image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageBase64: imageBase64,
                mimeType: 'image/png',
                question: 'What is this?'
            })
        });

        const data = await res.json();
        console.log("AI Response:", data);
    } catch (error) {
        console.error("Error connecting to AI:", error);
    }
};

testAIImage();
