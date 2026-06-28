let mediaRecorder;
let audioChunks = [];

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusText = document.getElementById('status');
const outputDiv = document.getElementById('output');

startBtn.onclick = async () => {
    outputDiv.innerHTML = 'Waiting for data...';
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.onstop = sendData;
        mediaRecorder.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
        statusText.innerText = "Recording... Speak now!";
    } catch (err) {
        alert("Mic error: " + err);
    }
};

stopBtn.onclick = () => {
    mediaRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusText.innerText = "AI is thinking...";
};

async function sendData() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('file', audioBlob, 'rec.wav');
    formData.append('patient_name', document.getElementById('patientName').value || "Unknown");

    try {
        // CHANGED TO 127.0.0.1 TO MATCH YOUR TERMINAL
        const response = await fetch('http://127.0.0.1:8000/process', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log("AI DATA RECEIVED:", data); // Check this in F12 console!
        
        statusText.innerText = "Done!";
        
        // This draws the result on your screen
        outputDiv.innerHTML = `
            <div style="background:#eef2ff; padding:15px; border-radius:8px; color:black; text-align:left;">
                <p><strong>Patient:</strong> ${data.patient_name}</p>
                <p><strong>Summary:</strong> ${data.summary}</p>
                <hr>
                <p><strong>Transcript:</strong> ${data.transcript}</p>
            </div>
        `;
    } catch (err) {
        statusText.innerText = "Error!";
        outputDiv.innerHTML = "Connection failed. Is the black terminal window still open?";
    }
}