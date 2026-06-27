let mediaRecorder;
let audioChunks = [];

document.getElementById('startBtn').onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = sendData;
    mediaRecorder.start();
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('status').innerText = "Recording...";
};

document.getElementById('stopBtn').onclick = () => {
    mediaRecorder.stop();
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('status').innerText = "Analyzing...";
};

async function sendData() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('file', audioBlob, 'rec.wav');
    formData.append('patient_name', document.getElementById('patientName').value || 'Unknown');
    const res = await fetch('http://localhost:8000/process', { method: 'POST', body: formData });
    const data = await res.json();
    document.getElementById('output').innerText = JSON.stringify(data, null, 2);
    document.getElementById('status').innerText = "Done";
}
