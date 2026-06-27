let mediaRecorder;
let audioChunks = [];

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusText = document.getElementById('status');
const outputDiv = document.getElementById('output');

startBtn.onclick = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.onstop = sendData;

        mediaRecorder.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
        statusText.innerText = "Recording...";
        statusText.style.color = "#ef4444";
    } catch (err) {
        alert("Microphone access denied or not found.");
    }
};

stopBtn.onclick = () => {
    mediaRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusText.innerText = "Analyzing Audio (Please wait)...";
    statusText.style.color = "#2563eb";
};

async function sendData() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('file', audioBlob, 'encounter.wav');
    formData.append('patient_name', document.getElementById('patientName').value || "Unknown Patient");

    try {
        const response = await fetch('http://localhost:8000/process', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error("Server Error");

        const data = await response.json();
        displayResult(data);
        
    } catch (err) {
        statusText.innerText = "Error processing recording.";
        console.error(err);
    }
}

function displayResult(data) {
    statusText.innerText = "Process Complete";
    statusText.style.color = "#10b981";

    outputDiv.innerHTML = `
        <div class="summary-section">
            <p><strong>Patient:</strong> ${data.patient_name}</p>
            <p><strong>Summary:</strong> ${data.summary}</p>
            <hr>
            <h4>Detected Medical Entities:</h4>
            <ul>
                <li><strong>Diagnoses:</strong> ${data.entities.DIAGNOSIS.join(', ') || 'None identified'}</li>
                <li><strong>Medications:</strong> ${data.entities.MEDICATION.join(', ') || 'None identified'}</li>
                <li><strong>Symptoms:</strong> ${data.entities.SYMPTOMS.join(', ') || 'None identified'}</li>
            </ul>
            <hr>
            <h4>Full Transcript:</h4>
            <p class="transcript-text">${data.transcript}</p>
        </div>
    `;
}