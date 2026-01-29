/* static/js/model.js */
// ==========================================
// CONFIG & STATE
// ==========================================
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

// UI Elements (Dashboard IDs)
const resultElement = document.getElementById('gesture-result');
const confText = document.getElementById('conf-text');
const confBar = document.getElementById('conf-bar');
const captureStatus = document.getElementById('capture-status');
const timerDisplay = document.getElementById('timer-display');
const capturedSpan = document.getElementById('captured-gestures');
const sentenceInfo = document.getElementById('final-sentence');

// Model Paths
const MODEL_PATH = '/model_artifacts/keypoint_classifier/keypoint_classifier.tflite';
const LABEL_PATH = '/model_artifacts/keypoint_classifier_label.csv';

let holistic;
let model;
let camera = null;
let labels = [];
let lastLogTime = 0;

// App State
let isCapturing = false;
let captureTimer = null;
let capturedGestures = [];

// ==========================================
// INITIALIZATION
// ==========================================
async function main() {
    await loadLabels();

    // Load Model (Old API from app.js)
    console.log("Loading TFLite model...");
    try {
        model = await tflite.loadTFLiteModel(MODEL_PATH);
        console.log("✅ Model Loaded");
    } catch (e) {
        console.error("Model load error:", e);
        resultElement.innerText = "Model Error";
        return;
    }

    // MediaPipe Setup (Matching app.js)
    holistic = new Holistic({
        locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1635989137/${file}`
    });

    holistic.setOptions({
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5
    });

    holistic.onResults(onResults);

    // Start camera automatically on load
    startCamera();
}

async function loadModel() {
    console.log("Loading TFLite model...");
    try {
        model = await tflite.loadTFLiteModel(MODEL_PATH);
        console.log("✅ Model Loaded");
    } catch (e) {
        console.error("Model load error:", e);
        resultElement.innerText = "Model Error";
        throw e; // Re-throw to prevent further execution if model fails
    }
}

// Start
async function startCamera() {
    if (!model) await loadModel();
    if (labels.length === 0) await loadLabels();

    if (!camera) {
        camera = new Camera(videoElement, {
            onFrame: async () => { await holistic.send({ image: videoElement }); },
            width: 640, height: 480
        });
    }
    camera.start();
    videoElement.addEventListener('loadeddata', resizeCanvas);
}

function stopCamera() {
    if (camera) {
        camera.stop();
        // camera = null; // Optional: keep instance or nullify. stop() should suffic
    }
}
// Export functions for HTML access
window.startCamera = startCamera;
window.stopCamera = stopCamera;

async function loadLabels() {
    try {
        const response = await fetch(LABEL_PATH);
        const text = await response.text();
        labels = text.trim().split('\n').map(line => line.split(',')[1]);
        console.log("✅ Labels Loaded:", labels);
    } catch (e) {
        console.error("Labels load error:", e);
    }
}

function resizeCanvas() {
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
}

// ==========================================
// LOGIC (Matching app.js exactly)
// ==========================================
function preprocessLandmarks(landmarks) {
    if (!landmarks || landmarks.length === 0) return null;

    const baseX = landmarks[0].x;
    const baseY = landmarks[0].y;
    const data = [];

    for (const lm of landmarks) {
        data.push(lm.x - baseX, lm.y - baseY);
    }

    const maxVal = Math.max(...data.map(Math.abs)) || 1;
    return data.map(v => v / maxVal);
}

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    const landmarks = results.rightHandLandmarks || results.leftHandLandmarks;

    if (landmarks) {
        // Draw (Using global drawing utils from script tags)
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: isCapturing ? '#ff0000' : '#00ccff',
            lineWidth: 4
        });
        drawLandmarks(canvasCtx, landmarks, {
            color: isCapturing ? '#ff0000' : '#ff007f',
            lineWidth: 2,
            radius: 4
        });

        // Predict
        if (model) {
            const inputData = preprocessLandmarks(landmarks);
            if (inputData) {
                // TFJS TFLite Alpha 8 API: requires tensor2d for predict? 
                // app.js used: tf.tensor2d([inputData])
                const inputTensor = tf.tensor2d([inputData]);
                const outputTensor = model.predict(inputTensor);
                const outputData = outputTensor.dataSync(); // Sync for simplicity matches app.js

                const maxProb = Math.max(...outputData);
                const classIndex = outputData.indexOf(maxProb);
                const gesture = labels[classIndex] || "Unknown";

                // UI Update
                if (resultElement) resultElement.innerText = gesture;
                if (confText) confText.innerText = `${(maxProb * 100).toFixed(1)}%`;
                if (confBar) confBar.style.width = `${maxProb * 100}%`;

                // Log to Server (Dashboard Feature - Keep this!)
                const now = Date.now();
                if (now - lastLogTime > 2000 && maxProb > 0.6) {
                    logPrediction(gesture, maxProb);
                    lastLogTime = now;
                }
            }
        }
    } else {
        if (resultElement) resultElement.innerText = "No Hand";
        if (confText) confText.innerText = "0%";
        if (confBar) confBar.style.width = "0%";
    }
    canvasCtx.restore();
}

async function logPrediction(gesture, confidence) {
    fetch('/api/log_prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gesture, confidence })
    }).catch(e => console.log("Log error:", e)); // Silent fail ok
}

// ==========================================
// CONTROLS (Timer & Sentence)
// ==========================================
function toggleCapture() {
    if (isCapturing) return;
    isCapturing = true;
    let countdown = 5;
    const btn = document.getElementById('capture-btn');

    btn.disabled = true;
    timerDisplay.style.display = 'block';
    timerDisplay.innerText = countdown;
    captureStatus.innerText = "⏳ Capturing...";

    const interval = setInterval(() => {
        countdown--;
        timerDisplay.innerText = countdown;

        if (countdown <= 0) {
            clearInterval(interval);
            timerDisplay.style.display = 'none';
            captureCurrentGesture();
            isCapturing = false;
            btn.disabled = false;
            captureStatus.innerText = "Captured!";
        }
    }, 1000);
}

function captureCurrentGesture() {
    const gesture = resultElement.innerText;
    if (gesture && gesture !== "No Hand" && gesture !== "Waiting..." && gesture !== "Unknown" && gesture !== "Model Error") {
        capturedGestures.push(gesture);
        capturedSpan.innerText = capturedGestures.join(', ');
        captureStatus.innerText = `✅ Added: ${gesture}`;
    } else {
        captureStatus.innerText = "❌ No gesture detected";
    }
}

function clearGestures() {
    capturedGestures = [];
    capturedSpan.innerText = "No gestures captured";
    sentenceInfo.innerText = "...";
    captureStatus.innerText = "Cleared";
}

async function formSentence() {
    if (capturedGestures.length === 0) {
        alert("Capture gestures first!");
        return;
    }

    try {
        const res = await fetch('/api/sentence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gestures: capturedGestures })
        });
        const data = await res.json();
        sentenceInfo.innerText = data.sentence;
    } catch (e) {
        console.error(e);
        sentenceInfo.innerText = "Error forming sentence";
    }
}

function speakResult() {
    const text = sentenceInfo.innerText;
    if (text && text !== "...") {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    }
}

// Start App
main();
